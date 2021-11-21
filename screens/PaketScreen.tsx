import { createStackNavigator, HeaderBackButton } from '@react-navigation/stack';
import * as React from 'react';
import { ActivityIndicator, Alert, Button, Dimensions, FlatList, Modal, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Video, AVPlaybackStatus } from 'expo-av';
import { Text, View } from '../components/Themed';
import { LinearGradient } from 'expo-linear-gradient';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import AutoHeightWebView from 'react-native-autoheight-webview';
import { API_URL } from '../constants/ENV';
import { User } from '../constants/context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PDFReader from 'rn-pdf-reader-js'

const PaketStack = createBottomTabNavigator()

export default function PaketScreen({route, navigation}) {
  const { paket } = route.params

  return (
    <View style={styles.container}>
    <LinearGradient style={{flexDirection: 'row', alignItems: 'center',}} colors={['#3C8BE7','#00EAFF']} start={[1,1]} end={[0,0]}>
      <Text style={{
        ...styles.title, paddingVertical: 50, flex: 1, textAlign: 'center',
        }}>{paket.name}</Text>
    </LinearGradient>
    <PaketStack.Navigator tabBarOptions={{style: {position: 'absolute', top: 0,}, labelPosition: 'beside-icon'}}>
      <PaketStack.Screen
        name="Videos" 
        options={{
          tabBarIcon: ({ color }) => (<Ionicons color={color} name="videocam" size={25} />),
          title: 'Video'
        }}
      >
        {props => <Videos paket_id={paket.id} summary={paket.summary} />}
      </PaketStack.Screen>
      <PaketStack.Screen 
        name="Trainings"
        options={{
          tabBarIcon: ({ color }) => (<Ionicons color={color} name="bulb" size={25} />),
          title: 'Latihan'
        }}
      >
        {props => <Trainings {...props} paket_id={paket.id} />}
      </PaketStack.Screen>
      <PaketStack.Screen
        name="Tryout"
        options={{
          tabBarIcon: ({ color }) => (<Ionicons color={color} name="create" size={25} />)
        }}
      >
        {props => <Tryout {...props} paket_id={paket.id} solution={paket.solution} duration={120} />} 
      </PaketStack.Screen>
    </PaketStack.Navigator>
    </View>
  )
}

const VideoStack = createStackNavigator()

function Videos(props: {paket_id: number, summary: string}) {
  const [isLoading, setLoading] = React.useState(true);
  return (
    <VideoStack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <VideoStack.Screen name="Videos" component={VideoList} initialParams={{props}} />
      <VideoStack.Screen name="Video" component={VideoScreen} />
      <VideoStack.Screen name="Summary">
        {() => <><PDFReader
          source={{uri:`${API_URL}/${props.summary}`}}
          onLoadEnd={() => setLoading(false)}
        />
        {isLoading?<ActivityIndicator
          animating={true}
          style={styles.indicator}
          size="large"
          color="#ffffff" />:null}</>}
      </VideoStack.Screen>
    </VideoStack.Navigator>
  )
}

function VideoList({ navigation, route }) {
  const { props } = route.params
  const [isLoading, setLoading] = React.useState(false);
  const [videos, setVideos] = React.useState([]);
  const [watched, setWatched] = React.useState([-99]);
  const loadVideos = () => {
    setLoading(true)
    fetch(API_URL+`/api/paket/videos/${props.paket_id}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${User.token}`
      }
    }).then(res => res.json())
    .then(data => {
      if (data) {
        setLoading(false)
        setVideos(data)
        console.log(data)
      }
    })
    .catch(err => {
      setLoading(false)
      Alert.alert('Terjadi kesalahan, tunggu beberapa saat.')
      console.log(err)
    })

  }

  React.useEffect(() => loadVideos(), [])
  React.useEffect(
    React.useCallback(() => {
      const unsuscribe = navigation.addListener('focus',() => {
        setLoading(true)
        AsyncStorage.getItem(`videos-${props.paket_id}`)
        .then(res => {
          if (res) {
            setWatched(JSON.parse(res))
          }
          setLoading(false)
        })
      })

      return unsuscribe
    }, [watched, navigation])
  )

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Video', {uri: item.file_path, id: item.id, paket_id: item.paket_id})}
      style={{flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(37,144,191,0.07)', marginHorizontal: 10, marginVertical: 5, padding: 30, borderRadius: 10}}
    >
      <Text style={{color: '#305F72', fontWeight: 'bold'}}>{item.title}</Text>
      <Text>
        {item.duration}{'  '}
        {watched.indexOf(item.id) == -1 ? <Ionicons name="time" style={{color: 'gray'}} size={15} /> : <Ionicons name="checkmark-circle" style={{color: 'green'}} size={15} />}  
      </Text>
    </TouchableOpacity>
  )

  return (
    <><View style={{...styles.container, paddingTop: 60, flexGrow: 1}}>
    <FlatList
      data={videos}
      renderItem={renderItem}
      keyExtractor={item => item.title}
    />
    {watched.length == videos.length?
    <TouchableOpacity
      onPress={() => navigation.navigate('Summary')}
      style={{flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#305F72', marginHorizontal: 10, marginVertical: 5, padding: 30, borderRadius: 10}}
    >
      <Text style={{color: '#FFFFFF', fontWeight: 'bold'}}>Baca Rangkuman</Text>
    </TouchableOpacity>:null}
    </View>
    {isLoading?<ActivityIndicator
      animating={true}
      style={styles.indicator}
      size="large"
      color="#ffffff" />:null}</>
  );
}

function VideoScreen({route}) {
  const { uri, id, paket_id } = route.params
  const video = React.useRef(null);
  const [status, setStatus] = React.useState({})
  return (
    <View style={styles.container}>
      <Video
        ref={video}
        style={styles.video}
        source={{
          uri: `${API_URL}/${uri}`,
        }}
        useNativeControls={true}
        resizeMode="contain"
        onPlaybackStatusUpdate={status => {
          setStatus(() => status)
          if (status.didJustFinish) {
            console.log('saving')
            AsyncStorage.getItem(`videos-${paket_id}`)
            .then(res => {
              if (res) {
                let watched: Array<number> = JSON.parse(res)
                if (watched.indexOf(id) == -1){
                  AsyncStorage.setItem(`videos-${paket_id}`,JSON.stringify([ ...watched ,id]))
                }
              }
              else {
                AsyncStorage.setItem(`videos-${paket_id}`,JSON.stringify([ id ]))
              }
            })
          }
        }}
        onFullscreenUpdate={async (fullScreen) => {
          if (fullScreen.fullscreenUpdate == Video.FULLSCREEN_UPDATE_PLAYER_WILL_PRESENT) {
            await ScreenOrientation.lockAsync(
              ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT,
            )
          }
          else if (fullScreen.fullscreenUpdate == Video.FULLSCREEN_UPDATE_PLAYER_WILL_DISMISS) {
            await ScreenOrientation.lockAsync(
              ScreenOrientation.OrientationLock.PORTRAIT,
            )
          }
        }}
      />
      <View>
        <Button
          title={status.isPlaying ? 'Pause' : 'Play'}
          onPress={() =>
            status.isPlaying ? video.current.pauseAsync() : video.current.playAsync()
          }
        />
      </View>
    </View>
  )
}

function Trainings(props: {paket_id: number}) {
  
  const [isLoading, setLoading] = React.useState(true);
  const [trainings, setTraining] = React.useState([]);
  const [answer, setAnswer] = React.useState([]);
  const [selected, setSelected] = React.useState(0);

  const loadTraining = () => {
    let isMounted = true
    setLoading(true)
    fetch(API_URL+`/api/paket/trainings/${props.paket_id}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${User.token}`
      }
    }).then(res => res.json())
    .then(data => {
      if (data) {
        if (isMounted) {
          setTraining(data)
          AsyncStorage.getItem(`training-ans-${props.paket_id}`)
          .then(res => {
            if (res) {
              setAnswer(JSON.parse(res))
            }
            setLoading(false)
          })
        }
        console.log('loaded training')
      }
    })
    .catch(err => {
      setLoading(false)
      Alert.alert('Terjadi kesalahan, tunggu beberapa saat.')
      console.log(err)
    })
    return () => {isMounted = false}
  }

  React.useEffect(() => loadTraining(), [])
  const [number, setNumber] = React.useState(0)
  if (isLoading) {
    return <ActivityIndicator
    animating={true}
    style={styles.indicator}
    size="large"
    color="#ffffff" />
  }
  return (
    <View style={{...styles.container, paddingTop: 60, flexGrow: 1,}}>
      <ScrollView>
        <View style={{marginHorizontal: 30, marginVertical: 20, padding: 20, backgroundColor: '#DBEBF2', borderRadius: 20,}}>
          <TouchableOpacity style={{position: 'absolute', top: '50%', left: -20, zIndex: 10, opacity: number==0?0.5:1}}
          disabled={number==0}
          onPress={() => {
            setNumber(number - 1)
            if (answer[number-1]) {
              setSelected(answer[number - 1])
            }
            else {
              setSelected(0)
            }
          }}
          >
            <Ionicons name="arrow-back-circle" size={40} color='#0088A4' />
          </TouchableOpacity>
          <TouchableOpacity style={{position: 'absolute', top: '50%', right: -20, zIndex: 10, opacity: number==trainings.length-1?0.5:1}}
          disabled={number==trainings.length-1}
          onPress={() => {
            setNumber(number + 1)
            if (answer[number + 1]) {
              setSelected(answer[number + 1])
            }
            else {
              setSelected(0)
            }
          }}
          >
            <Ionicons name="arrow-forward-circle" size={40} color='#0088A4' />
          </TouchableOpacity>
          <Text style={{color: '#0088A4', fontSize: 18, fontWeight: '700', alignSelf: 'stretch', textAlign: 'center'}}>
            No. {number + 1}
          </Text>
          <AutoHeightWebView 
              style={{ width: Dimensions.get('screen').width - 120 }}
              injectedJavaScript={`const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=0.5, maximum-scale=0.5, user-scalable=2.0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
              scalesPageToFit={false}
              source={{html: 
            `<!DOCTYPE html><html><head>
            <style>
              body { 
                font-size: 90%; word-wrap: break-word; overflow-wrap: break-word;
                color: #0088A4;
              }
              img {
                width: 100%
              }
            </style>
            </head><body>${trainings[number].question}</body></html>`
          }} />
          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'stretch'}}
            onPress={() => {
              setSelected(1)
            }}
            disabled={answer[number]}
          >
          <Ionicons style={{margin: 10, paddingTop: 5,}} name={answer[number] && trainings[number].key == 1?'checkmark-circle':(selected==1?'radio-button-on-outline':'radio-button-off-outline')} color={trainings[number].key == 1?'green':'black'} />
            <AutoHeightWebView
              style={{ width: Dimensions.get('screen').width - 140 }}
              injectedJavaScript={`const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=0.5, maximum-scale=0.5, user-scalable=2.0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
              scalesPageToFit={false}
              source={{html: 
              `<!DOCTYPE html><html><head>
              <style>
                body { 
                  font-size: 90%; word-wrap: break-word; overflow-wrap: break-word;
                  color: #0088A4;
                }
                img {
                  width: 100%;
                }
              </style>
              </head><body>${trainings[number].option_a}</body></html>`
            }} />
          </TouchableOpacity>
          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'stretch'}}
            onPress={() => {
              setSelected(2)
            }}
            disabled={answer[number]}
          >
            <Ionicons style={{margin: 10, paddingTop: 5,}} name={answer[number] && trainings[number].key == 2?'checkmark-circle':(selected==2?'radio-button-on-outline':'radio-button-off-outline')} color={trainings[number].key == 2?'green':'black'} />
            <AutoHeightWebView
              style={{ width: Dimensions.get('screen').width - 140 }}
              injectedJavaScript={`const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=0.5, maximum-scale=0.5, user-scalable=2.0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
              scalesPageToFit={false}
              source={{html: 
              `<!DOCTYPE html><html><head>
              <style>
                body { 
                  font-size: 90%; word-wrap: break-word; overflow-wrap: break-word;
                  color: #0088A4;
                }
                img {
                  width: 100%;
                }
              </style>
              </head><body>${trainings[number].option_b}</body></html>`
            }} />
          </TouchableOpacity>
          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'stretch'}}
            onPress={() => {
              setSelected(3)
            }}
            disabled={answer[number]}
          >
          <Ionicons style={{margin: 10, paddingTop: 5,}} name={answer[number] && trainings[number].key == 3?'checkmark-circle':(selected==3?'radio-button-on-outline':'radio-button-off-outline')} color={trainings[number].key == 3?'green':'black'} />
            <AutoHeightWebView
              style={{ width: Dimensions.get('screen').width - 140 }}
              injectedJavaScript={`const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=0.5, maximum-scale=0.5, user-scalable=2.0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
              scalesPageToFit={false}
              source={{html: 
              `<!DOCTYPE html><html><head>
              <style>
                body { 
                  font-size: 90%; word-wrap: break-word; overflow-wrap: break-word;
                  color: #0088A4;
                }
                img {
                  width: 100%;
                }
              </style>
              </head><body>${trainings[number].option_c}</body></html>`
            }} />
          </TouchableOpacity>
          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'stretch'}}
            onPress={() => {
              setSelected(4)
            }}
            disabled={answer[number]}
          >
          <Ionicons style={{margin: 10, paddingTop: 5,}} name={answer[number] && trainings[number].key == 4?'checkmark-circle':(selected==4?'radio-button-on-outline':'radio-button-off-outline')} color={trainings[number].key == 4?'green':'black'} />
            <AutoHeightWebView
              style={{ width: Dimensions.get('screen').width - 140 }}
              injectedJavaScript={`const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=0.5, maximum-scale=0.5, user-scalable=2.0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
              scalesPageToFit={false}
              source={{html: 
              `<!DOCTYPE html><html><head>
              <style>
                body { 
                  font-size: 90%; word-wrap: break-word; overflow-wrap: break-word;
                  color: #0088A4;
                }
                img {
                  width: 100%;
                }
              </style>
              </head><body>${trainings[number].option_d}</body></html>`
            }} />
          </TouchableOpacity>
          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'stretch'}}
            onPress={() => {
              setSelected(5)
            }}
            disabled={answer[number]}
          >
          <Ionicons style={{margin: 10, paddingTop: 5,}} name={answer[number] && trainings[number].key == 5?'checkmark-circle':(selected==5?'radio-button-on-outline':'radio-button-off-outline')} color={trainings[number].key == 5?'green':'black'} />
            <AutoHeightWebView
              style={{ width: Dimensions.get('screen').width - 140 }}
              injectedJavaScript={`const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=0.5, maximum-scale=0.5, user-scalable=2.0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
              scalesPageToFit={false}
              source={{html: 
              `<!DOCTYPE html><html><head>
              <style>
                body { 
                  font-size: 90%; word-wrap: break-word; overflow-wrap: break-word;
                  color: #0088A4;
                }
                img {
                  width: 100%;
                }
              </style>
              </head><body>${trainings[number].option_e}</body></html>`
            }} />
          </TouchableOpacity>
          {!answer[number]?<TouchableOpacity style={{backgroundColor: '#0088A4', borderRadius: 20, margin: 20, alignSelf: 'stretch', padding: 10}}
            onPress={() => {
              let ans = answer.slice()
              ans[number] = selected
              setAnswer(ans)
              AsyncStorage.setItem(`training-ans-${props.paket_id}`, JSON.stringify(ans))
            }}
          >
            <Text style={{width: '100%', textAlign: 'center', color: '#FFFFFF', fontWeight: 'bold'}}>Jawab</Text>
          </TouchableOpacity>:
          <><Text style={{ color: '#0088A4', fontSize: 18, fontWeight: '700', alignSelf: 'stretch' }}>
              Jawaban: {String.fromCharCode(64 + trainings[number].key)}
            </Text><AutoHeightWebView
                style={{ width: Dimensions.get('screen').width - 120 }}
                injectedJavaScript={`const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=0.5, maximum-scale=0.5, user-scalable=2.0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
                scalesPageToFit={false}
                source={{
                  html: `<!DOCTYPE html><html><head>
            <style>
              body { 
                font-size: 90%; word-wrap: break-word; overflow-wrap: break-word;
                color: #0088A4;
              }
              img {
                width: 100%
              }
            </style>
            </head><body>${trainings[number].solution}</body></html>`
                }} /></>}
        </View>
      </ScrollView>
    </View>
  )
}

function Tryout(props: {paket_id: number, solution: string, duration: number}) {
  const [toState, setTO] = React.useState({})
  const [toData, setToData] = React.useState([])
  const [answer, setAnswer] = React.useState([])
  const [isLoading, setLoading] = React.useState(true)
  const [selected, setSelected] = React.useState(0);
  const [number, setNumber] = React.useState(0)
  const [modalVisible, setModalVisible] = React.useState(false)

  const loadFromServer = () => {
    let isMounted = true
    setLoading(true)
    fetch(API_URL+`/api/paket/tryouts/${props.paket_id}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${User.token}`
      }
    }).then(res => res.json())
    .then(data => {
      if (data) {
        if (isMounted) {
          setToData(data)
          AsyncStorage.getItem(`tryouts-ans-${props.paket_id}`)
          .then(res => {
            if (res) {
              setAnswer(JSON.parse(res))
            }
            setLoading(false)
          })
        }
        console.log('loaded training')
      }
    })
    .catch(err => {
      setLoading(false)
      Alert.alert('Terjadi kesalahan, tunggu beberapa saat.')
      console.log(err)
    })
    return () => {isMounted = false}
  }

  React.useEffect(() => loadFromServer(), [])

  const loadSubmitTime = () => {
    AsyncStorage.getItem(`to-state-${props.paket_id}`)
    .then( time => {
      if (time) {
        let tempState = JSON.parse(time)
        setTO(tempState)
        // if (tempState.submitTime) {
        //   setTimeout(submit, )
        // }
      }
    } )
  }

  React.useEffect(() => loadSubmitTime(), [])

  const startTO = () => {
    let now = new Date()
    let stime = new Date()
    stime.setMinutes( now.getMinutes() + props.duration)
    setTO({...toState, submitTime: stime})
  }

  const submit = () => {
    let ans = answer.slice()
    ans[number] = selected
    setAnswer(ans)
    setTO({...toState, submitTime: null})
    let trueValue = 0
    toData.forEach((item, index) => {
      if (item.key == answer[index]) {
        trueValue += 1
      }
    })
    console.log(answer)
    Alert.alert(`Nilai anda ${trueValue*100/toData.length}`)
  }

  if (isLoading) {
    return <ActivityIndicator
    animating={true}
    style={styles.indicator}
    size="large"
    color="#ffffff" />
  }

  return (
    <View style={{...styles.container, paddingTop: 60, flexGrow: 1, justifyContent: 'center'}}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false)
        }}
      >
        <PDFReader
          source={{uri:`${API_URL}/${props.solution}`}}
        />
      </Modal>
      {!toState.submitTime?
      (<><Text style={{width: '100%', textAlign: 'center', color: '#0088A4', fontWeight: 'bold', fontSize: 20, marginVertical: 10}}>
        Sudah memahami materi?{'\n'}Yuk uji kemampuanmu!
      </Text>
      <TouchableOpacity style={{backgroundColor: '#0088A4', borderRadius: 20, marginHorizontal: 80, alignSelf: 'stretch', padding: 10}} onPress={startTO}>
        <Text style={{width: '100%', textAlign: 'center', color: '#FFFFFF', fontWeight: 'bold'}}>Mulai Tryout</Text>
      </TouchableOpacity>
      {answer.length>0? (
      <TouchableOpacity style={{backgroundColor: '#0088A4', borderRadius: 20, marginHorizontal: 80, alignSelf: 'stretch', padding: 10, marginTop: 20}} onPress={() => setModalVisible(true)}>
        <Text style={{width: '100%', textAlign: 'center', color: '#FFFFFF', fontWeight: 'bold'}}>Lihat Pembahasan</Text>
      </TouchableOpacity>) :null}
      </>)
      :
      (<ScrollView>
        <View style={{marginHorizontal: 30, marginVertical: 20, padding: 20, backgroundColor: '#DBEBF2', borderRadius: 20,}}>
          <TouchableOpacity style={{position: 'absolute', top: '50%', left: -20, zIndex: 10, opacity: number==0?0.5:1}}
          disabled={number==0}
          onPress={() => {
            let ans = answer.slice()
            ans[number] = selected
            setAnswer(ans)
            setNumber(number - 1)
            if (answer[number-1]) {
              setSelected(answer[number - 1])
            }
            else {
              setSelected(0)
            }
          }}
          >
            <Ionicons name="arrow-back-circle" size={40} color='#0088A4' />
          </TouchableOpacity>
          <TouchableOpacity style={{position: 'absolute', top: '50%', right: -20, zIndex: 10, opacity: number==toData.length-1?0.5:1}}
          disabled={number==toData.length-1}
          onPress={() => {
            let ans = answer.slice()
            ans[number] = selected
            setAnswer(ans)
            setNumber(number + 1)
            if (answer[number + 1]) {
              setSelected(answer[number + 1])
            }
            else {
              setSelected(0)
            }
          }}
          >
            <Ionicons name="arrow-forward-circle" size={40} color='#0088A4' />
          </TouchableOpacity>
          <Text style={{color: '#0088A4', fontSize: 18, fontWeight: '700', alignSelf: 'stretch', textAlign: 'center'}}>
            No. {number + 1}
          </Text>
          <AutoHeightWebView 
              style={{ width: Dimensions.get('screen').width - 120 }}
              injectedJavaScript={`const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=0.5, maximum-scale=0.5, user-scalable=2.0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
              scalesPageToFit={false}
              source={{html: 
            `<!DOCTYPE html><html><head>
            <style>
              body { 
                font-size: 90%; word-wrap: break-word; overflow-wrap: break-word;
                color: #0088A4;
              }
              img {
                width: 100%
              }
            </style>
            </head><body>${toData[number].question}</body></html>`
          }} />
          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'stretch'}}
            onPress={() => {
              setSelected(1)
            }}
          >
          <Ionicons style={{margin: 10, paddingTop: 5,}} name={(selected==1?'radio-button-on-outline':'radio-button-off-outline')} />
            <AutoHeightWebView
              style={{ width: Dimensions.get('screen').width - 140 }}
              injectedJavaScript={`const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=0.5, maximum-scale=0.5, user-scalable=2.0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
              scalesPageToFit={false}
              source={{html: 
              `<!DOCTYPE html><html><head>
              <style>
                body { 
                  font-size: 90%; word-wrap: break-word; overflow-wrap: break-word;
                  color: #0088A4;
                }
                img {
                  width: 100%;
                }
              </style>
              </head><body>${toData[number].option_a}</body></html>`
            }} />
          </TouchableOpacity>
          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'stretch'}}
            onPress={() => {
              setSelected(2)
            }}
          >
          <Ionicons style={{margin: 10, paddingTop: 5,}} name={(selected==2?'radio-button-on-outline':'radio-button-off-outline')} />
            <AutoHeightWebView
              style={{ width: Dimensions.get('screen').width - 140 }}
              injectedJavaScript={`const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=0.5, maximum-scale=0.5, user-scalable=2.0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
              scalesPageToFit={false}
              source={{html: 
              `<!DOCTYPE html><html><head>
              <style>
                body { 
                  font-size: 90%; word-wrap: break-word; overflow-wrap: break-word;
                  color: #0088A4;
                }
                img {
                  width: 100%;
                }
              </style>
              </head><body>${toData[number].option_b}</body></html>`
            }} />
          </TouchableOpacity>
          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'stretch'}}
            onPress={() => {
              setSelected(3)
            }}
          >
          <Ionicons style={{margin: 10, paddingTop: 5,}} name={(selected==3?'radio-button-on-outline':'radio-button-off-outline')} />
            <AutoHeightWebView
              style={{ width: Dimensions.get('screen').width - 140 }}
              injectedJavaScript={`const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=0.5, maximum-scale=0.5, user-scalable=2.0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
              scalesPageToFit={false}
              source={{html: 
              `<!DOCTYPE html><html><head>
              <style>
                body { 
                  font-size: 90%; word-wrap: break-word; overflow-wrap: break-word;
                  color: #0088A4;
                }
                img {
                  width: 100%;
                }
              </style>
              </head><body>${toData[number].option_c}</body></html>`
            }} />
          </TouchableOpacity>
          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'stretch'}}
            onPress={() => {
              setSelected(4)
            }}
          >
          <Ionicons style={{margin: 10, paddingTop: 5,}} name={(selected==4?'radio-button-on-outline':'radio-button-off-outline')} />
            <AutoHeightWebView
              style={{ width: Dimensions.get('screen').width - 140 }}
              injectedJavaScript={`const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=0.5, maximum-scale=0.5, user-scalable=2.0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
              scalesPageToFit={false}
              source={{html: 
              `<!DOCTYPE html><html><head>
              <style>
                body { 
                  font-size: 90%; word-wrap: break-word; overflow-wrap: break-word;
                  color: #0088A4;
                }
                img {
                  width: 100%;
                }
              </style>
              </head><body>${toData[number].option_d}</body></html>`
            }} />
          </TouchableOpacity>
          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'stretch'}}
            onPress={() => {
              setSelected(5)
            }}
          >
          <Ionicons style={{margin: 10, paddingTop: 5,}} name={(selected==5?'radio-button-on-outline':'radio-button-off-outline')} />
            <AutoHeightWebView
              style={{ width: Dimensions.get('screen').width - 140 }}
              injectedJavaScript={`const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=0.5, maximum-scale=0.5, user-scalable=2.0'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); `}
              scalesPageToFit={false}
              source={{html: 
              `<!DOCTYPE html><html><head>
              <style>
                body { 
                  font-size: 90%; word-wrap: break-word; overflow-wrap: break-word;
                  color: #0088A4;
                }
                img {
                  width: 100%;
                }
              </style>
              </head><body>${toData[number].option_e}</body></html>`
            }} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={{backgroundColor: '#0088A4', borderRadius: 20, margin: 20, alignSelf: 'stretch', padding: 10}}
          onPress={submit}
        >
          <Text style={{width: '100%', textAlign: 'center', color: '#FFFFFF', fontWeight: 'bold'}}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>)
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  video: {
    flex: 1,
    alignSelf: 'stretch',
  },
  indicator: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
});

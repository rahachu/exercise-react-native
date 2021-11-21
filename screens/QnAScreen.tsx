import { createStackNavigator, HeaderBackButton } from '@react-navigation/stack';
import * as React from 'react';
import { ActivityIndicator, Dimensions, FlatList, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { Text, View, Image, StatusBar } from 'react-native';
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import * as ImagePicker from 'expo-image-picker'
import AutoHeightWebView from 'react-native-autoheight-webview'
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { API_URL } from '../constants/ENV';
import { User } from '../constants/context';
import { Alert } from 'react-native';

const QnAStack = createStackNavigator();

export default function QnAScreen() {
  return (
    <QnAStack.Navigator initialRouteName="Home" screenOptions={{headerShown: false}}>
      <QnAStack.Screen name="Home" component={Home} />
      <QnAStack.Screen name="New" component={NewQuestion} />
      <QnAStack.Screen name="Question" component={Question} />
    </QnAStack.Navigator>
  )
}

function Home({navigation}) {
  const [questions, setQuestions] = React.useState([])
  const isFocused = useIsFocused()
  const [isLoading, setLoading] = React.useState(false)

  const loadQuestions = () => {
    fetch(API_URL+`/api/qna`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${User.token}`
      }
    }).then(res => res.json())
    .then(data => {
      if (data) {
        setQuestions(data)
      }
    })
    .catch(err => {
      console.log(err)
    })
  }

  React.useEffect(() => loadQuestions(), [])

  const renderItem = ({ item, index }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardContent}>{item.content.replace(/(<([^>]+)>)/ig, '')}</Text>
      <TouchableOpacity onPress={() => navigation.push('Question', {question_id: item.id})} style={{...styles.link, alignSelf: 'flex-end'}}>
          <Text style={styles.linkText}>Lihat lebih lanjut</Text>
      </TouchableOpacity>
    </View>)
  
  return (
    <View style={styles.container}>
      {isFocused? <StatusBar translucent={true} barStyle="dark-content" /> : null}
      <View>
        <Text style={styles.title}>Ada Kesulitan?</Text>
        <Text style={styles.subtitle}>Dapatkan Jawaban Akurat,{'\n'}Kapanpun, Dimanapun</Text>
      </View>
      <Image style={styles.image} source={require('../assets/images/icon-question.png')} resizeMode="contain" />
      <TouchableOpacity onPress={() => navigation.push('New')} style={styles.link}>
          <Text style={styles.linkText}>Tanya</Text>
      </TouchableOpacity>
      <LinearGradient colors={['#3C8BE7','#00EAFF']} start={[1,1]} end={[0,0]}  style={styles.qContainer}>
        <Text style={{color: '#E9F8FF', fontSize: 20, fontWeight: 'bold', marginLeft: 250, alignSelf: 'flex-start'}}>Pertanyaan Baru</Text>
        <FlatList
          data={questions}
          renderItem={renderItem}
          onRefresh={() => {
            setLoading(true)
            loadQuestions()
            setLoading(false)
          }}
          refreshing={isLoading}
          keyExtractor={item => item.title}
        />
      </LinearGradient>
    </View>
  );
}

function NewQuestion({navigation}) {
  React.useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, [])

  let editor = React.createRef() || React.useRef()
  let scrollRef = React.createRef() || React.useRef()
  const [content, setContent] = React.useState('')
  const [value, onChangeText] = React.useState('');

  async function onPressAddImage() {
    let image = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
    })
    // insert URL
    // editor.current?.insertImage(
    //     'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/100px-React-icon.svg.png',
    //     'background: gray;',
    // );
    // insert base64
    if (!image.cancelled) {
      editor.current?.insertImage('data:image/jpeg;base64,' + image.base64)
    }
  }

  return (
      <View style={{...styles.container, paddingTop: 30}}>
        <View style={{flexDirection: 'row', width: '100%', justifyContent: 'space-between', padding: 20}}>
          <HeaderBackButton
            onPress={() => navigation.pop()} 
          />
          <TouchableOpacity
            onPress={() => {
              fetch(API_URL+`/api/qna/new`, {
                method: 'POST',
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${User.token}`
                },
                body: JSON.stringify({
                  title: value,
                  content: content,
                  user_id: User.id
                })
              }).then(res => res.json())
              .then(data => {
                if (data.title) {
                  Alert.alert('Terkirim!!')
                  navigation.pop()
                }
              })
              .catch(err => {
                console.log(err)
              })
            }}
          style={{...styles.link, alignSelf: 'flex-end'}}>
              <Text style={styles.linkText}>Kirim</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={{ alignSelf: 'stretch', marginHorizontal: 20, backgroundColor: 'white', borderRadius: 10, padding: 5 }}
          onChangeText={text => onChangeText(text)}
          value={value}
          placeholder="Subject"
        />
        <RichToolbar 
          editor={editor}
          selectedIconTint={'#2590BF'}
          onPressAddImage={onPressAddImage}
          actions={[
            actions.undo,
            actions.redo,
            actions.insertImage,
            actions.insertVideo,
            actions.setBold,
            actions.setItalic,
            actions.insertBulletsList,
            actions.insertOrderedList,
            actions.insertLink,
            actions.keyboard,
            actions.setStrikethrough,
            actions.setUnderline,
            actions.removeFormat,
          ]}
          style={{width: Dimensions.get("window").width - 50}}
        />
        <ScrollView
        nestedScrollEnabled={true}
        style={styles.editor}
        ref={scrollRef}
        keyboardDismissMode={'none'}
        scrollEventThrottle={20}
        >
          <RichEditor
            ref={editor}
            androidHardwareAccelerationDisabled={true}
            style={styles.editor}
            containerStyle={{borderRadius: 10, marginBottom: 15}}
            placeholder="Tulis pertanyaanmu" 
            scrollEnabled={false}
            onCursorPosition={(scrollY) => {
              // Positioning scroll bar
              scrollRef.current.scrollTo({y: scrollY - 30, animated: true})
            }}
            initialHeight={Dimensions.get("window").height * 0.5}
            onChange={text => setContent(text)}
          />
        </ScrollView>
      </View>
  )
}

function Question({route, navigation}) {
  const { question_id } =  route.params
  const [ question, setQuestion ] = React.useState({})
  const [content, setContent] = React.useState('')
  const [isLoading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, [])

  const loadQuestions = () => {
    setLoading(true)
    fetch(API_URL+`/api/qna/${question_id}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${User.token}`
      }
    }).then(res => res.json())
    .then(data => {
      if (data) {
        setQuestion(data)
        console.log(data)
        setLoading(false)
      }
    })
    .catch(err => {
      console.log(err)
    })
  }

  React.useEffect(() => loadQuestions(), [])

  let editor = React.createRef() || React.useRef()
  let scrollRef = React.createRef() || React.useRef()

  async function onPressAddImage() {
    let image = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
    })
    // insert URL
    // editor.current?.insertImage(
    //     'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/100px-React-icon.svg.png',
    //     'background: gray;',
    // );
    // insert base64
    if (!image.cancelled) {
      editor.current?.insertImage('data:image/jpeg;base64,' + image.base64)
    }
  }

  if (isLoading) {
    return <ActivityIndicator
    animating={true}
    style={styles.indicator}
    size="large"
    color="#ffffff" />
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent={true} barStyle="dark-content" />
      <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', paddingLeft: 20, marginBottom: 15 }}>
        <HeaderBackButton
          onPress={() => navigation.pop()} />
      </View>
      <View style={{ flex: 1, flexDirection: 'row', width: Dimensions.get("window").width - 40, marginBottom: 10 }}>
          <View style={{ alignItems: "center", maxWidth: 60 }}>
            <Image source={{ uri: question.user.profile_photo_url }} style={{ width: 60, height: 60, borderRadius: 40, }} />
            <Text numberOfLines={2} style={{ ...styles.cardContent, fontSize: 12, textAlign: 'center' }}>{question.user.name}</Text>
          </View>
          <View style={{ marginLeft: 20, backgroundColor: '#DBF0FF', borderRadius: 20, flexGrow: 1 }}>
            <Text style={{ color: '#0088A4', backgroundColor: '#DBF0FF', fontSize: 20, fontWeight: 'bold', marginLeft: 10, marginTop: 10, }}>{question.title}</Text>
            <AutoHeightWebView
              androidHardwareAccelerationDisabled={true}
              originWhitelist={['*']}
              style={{
                width: Dimensions.get("screen").width - 140,
                marginLeft: 10,
              }}
              source={{
                html: `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                font-size: 100%; word-wrap: break-word; overflow-wrap: break-word;
                background-color: #DBF0FF;
                color: #0088A4;
              }
              img {
                width: 100%;
              }
            </style>
            </head><body>${question.content}</body></html>`
              }} />
          </View>
        </View><View style={{ ...styles.container, paddingTop: 10, flexGrow: 1 }}>
          <RichToolbar
            editor={editor}
            selectedIconTint={'#2590BF'}
            onPressAddImage={onPressAddImage}
            actions={[
              actions.undo,
              actions.redo,
              actions.insertImage,
              actions.insertVideo,
              actions.setBold,
              actions.setItalic,
              actions.insertBulletsList,
              actions.insertOrderedList,
              actions.insertLink,
              actions.keyboard,
              actions.setStrikethrough,
              actions.setUnderline,
              actions.removeFormat,
            ]}
            style={{ width: Dimensions.get("window").width - 50 }} />
          <View style={{ flexGrow: 1, height: 100, borderRadius: 10, marginBottom: 15 }}>
            <ScrollView nestedScrollEnabled={true}
              style={{ flex: 1, height: 100 }}
              ref={scrollRef}
              keyboardDismissMode={'none'}
              scrollEventThrottle={20}
            >
              <RichEditor
                ref={editor}
                androidHardwareAccelerationDisabled={true}
                style={{ width: Dimensions.get("window").width - 40, minHeight: 100 }}
                placeholder="Tulis jawabanmu"
                initialHeight={100}
                scrollEnabled={false}
                onChange={text => setContent(text)}
                onCursorPosition={(scrollY) => {
                  // Positioning scroll bar
                  scrollRef.current.scrollTo({ y: scrollY - 30, animated: true });
                  console.log(scrollY - 30);
                } } />
            </ScrollView>
          </View>
          <TouchableOpacity onPress={() => {
            fetch(API_URL+`/api/qna/answer`, {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${User.token}`
              },
              body: JSON.stringify({
                question_id: question_id,
                content: content,
                user_id: User.id
              })
            }).then(res => res.json())
            .then(data => {
              if (data.id) {
                Alert.alert('Terkirim!!')
                setContent('')
                editor.current?.setContentHTML('')
                loadQuestions()
              }
            })
            .catch(err => {
              console.log(err)
            })
          }} style={{ ...styles.link, alignSelf: 'flex-end', zIndex: 10 }}>
            <Text style={styles.linkText}>Komentar</Text>
          </TouchableOpacity>
        </View><Text style={{ ...styles.subtitle, marginBottom: 15, width: Dimensions.get("window").width - 40 }}>Jawaban</Text><View style={{ flex: 1 }}>
          <FlatList
            data={question.answers}
            keyExtractor={item => item.id.toString()}
            renderItem={({item}) => <Comment comment={item} />}
          />
        </View>
    </View>
  )
}

function Comment(props: {comment: Object}) {
  return (
    <View style={{flex: 1, flexDirection: 'row', width: Dimensions.get("window").width - 40, marginBottom: 10}}>
      <View style={{alignItems: "center", maxWidth: 60}}>
        <Image source={{uri: props.comment.user.profile_photo_url}} style={{width: 60, height: 60, borderRadius: 40,}} />
        <Text numberOfLines={2} style={{...styles.cardContent, fontSize: 12, textAlign: 'center'}}>{props.comment.user.name}</Text>
      </View>
      <View style={{marginLeft: 20, overflow: 'hidden', borderRadius: 20, justifyContent: 'center', backgroundColor: '#DBF0FF'}}>
        <AutoHeightWebView
          style={{
            width: Dimensions.get("screen").width - 130,
            margin: 5,
          }}
          androidHardwareAccelerationDisabled={true}
          startInLoadingState={true}
          originWhitelist={['*']}
          source={{html: 
            `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                font-size: 100%; word-wrap: break-word; overflow-wrap: break-word;
                color: #0088A4;
              }
              img {
                width: 100%;
              }
            </style>
            </head><body>${props.comment.content}</body></html>`
          }}
          renderError={(errorname) => <Text>{errorname}</Text>}
          scalesPageToFit={true}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  qContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingTop: 30,
    width: Dimensions.get("window").width + 400,
    borderTopLeftRadius: (Dimensions.get("window").width + 400) / 2,
    borderTopRightRadius: (Dimensions.get("window").width + 400) / 2,
    marginLeft: -200,
    marginRight: -200,
    backgroundColor: '#00EAFF',
    textAlign: 'left',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#2590BF',
  },
  subtitle: {
    fontSize: 20,
    color: '#2590BF',
  },
  image: {
    width: Dimensions.get("window").width / 2,
    height: Dimensions.get("window").width / 2,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  link: {
    paddingVertical: 10,
    paddingHorizontal: 40,
    backgroundColor: '#2590BF',
    borderRadius: 30,
  },
  linkText: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
  },
  card: {
    flex: 1,
    width: Dimensions.get("window").width * 0.9,
    backgroundColor: '#E9F8FF',
    margin: 10,
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2590BF',
  },
  cardContent: {
    fontSize: 14,
    color: '#2590BF',
  },
  editor: {
    width: Dimensions.get("window").width - 40,
    flexGrow: 1,
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

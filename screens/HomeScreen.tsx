import * as React from 'react';
import { StyleSheet, ImageBackground, Text as NormalText, Image, Dimensions, Alert, TouchableOpacity, ScrollView, StatusBar, Modal, TouchableWithoutFeedback, ActivityIndicator, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { View, Text } from '../components/Themed'
import { paket } from '../types';
import { Learning } from '../components/Custom';
import { AuthContext, User } from '../constants/context';
import { useIsFocused } from '@react-navigation/native';
import { createStackNavigator, HeaderBackButton } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import PaketScreen from './PaketScreen';
import * as ImagePicker from 'expo-image-picker'
import { API_URL } from '../constants/ENV';

const HomeStack = createStackNavigator();

export default function HomeScreen() {
  const isFocused = useIsFocused()

  return (
    <>
    {isFocused? <StatusBar translucent={true} barStyle="light-content" /> : null}
    <HomeStack.Navigator initialRouteName="Home" screenOptions={{headerShown: false}}>
      <HomeStack.Screen name="Home" component={Home} />
      <HomeStack.Screen name="Beli" component={BeliPaketScreen} />
      <HomeStack.Screen name="Paket" component={PaketScreen} />
      <HomeStack.Screen name="Pengaturan" component={PengaturanScreen} />
    </HomeStack.Navigator>
    </>
  )
}

function Home({navigation}) {
  const user = User
  const [pakets, setPakets] = React.useState([])
  const [isLoading, setLoading] = React.useState(false)

  const loadPakets = () => {
    fetch(API_URL+`/api/paket/own`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${User.token}`
      }
    }).then(res => res.json())
    .then(data => {
      if (data) {
        setPakets(data)
      }
    })
    .catch(err => {
      console.log(err)
    })
  }

  React.useEffect(() => loadPakets(), [])

  return (
    <View style={styles.container}>
      <ImageBackground source={require('C:/Users/Raha/Documents/Projects/BeAnActuary/assets/images/bg-pattern.png')} style={styles.bgimg} resizeMode="contain">
        <NormalText style={styles.title}>Selamat Datang,{"\n"+user.name}!</NormalText>
        <View style={styles.profile}>
          <Image source={{uri: user.profile_photo_url}} style={styles.avatar} />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={()=> {
                navigation.dangerouslyGetParent().navigate('QNA')
              }}
            >
              <Ionicons style={styles.icon} name="chatbubbles-outline"></Ionicons>
              <NormalText style={{color: '#1AC1F5', fontSize: 10, textAlign: 'center'}}>Tanya Jawab</NormalText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={()=> Alert.alert('Hehe')}
            >
              <Ionicons style={styles.icon} name="rocket-outline"></Ionicons>
              <NormalText style={{color: '#1AC1F5', fontSize: 10, textAlign: 'center'}}>Artikel Baru</NormalText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={()=> navigation.push('Beli')}
            >
              <Ionicons style={styles.icon} name="cart-outline"></Ionicons>
              <NormalText style={{color: '#1AC1F5', fontSize: 10, textAlign: 'center'}}>Beli Paket</NormalText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={()=> {
                navigation.dangerouslyGetParent().navigate('CALENDAR')
              }}
            >
              <Ionicons style={styles.icon} name="calendar-outline"></Ionicons>
              <NormalText style={{color: '#1AC1F5', fontSize: 10, textAlign: 'center'}}>Kalender</NormalText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={()=> Alert.alert('Hehe')}
            >
              <Ionicons style={styles.icon} name="bookmarks-outline"></Ionicons>
              <NormalText style={{color: '#1AC1F5', fontSize: 10, textAlign: 'center'}}>Disimpan</NormalText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={()=> navigation.push('Pengaturan')}
            >
              <Ionicons style={styles.icon} name="settings-outline"></Ionicons>
              <NormalText style={{color: '#1AC1F5', fontSize: 10, textAlign: 'center'}}>Pengaturan</NormalText>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={{textAlign: 'center', fontSize: 18, fontWeight: 'bold', marginTop: 8, marginBottom: 50, color: '#ffffff'}}>Proses Pembelajaran</Text>
      </ImageBackground>
      <View style={styles.learn}>
        <FlatList
          data={pakets}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => (<Learning content={item} key={index} onPress={() => {
            navigation.navigate('Paket', {paket: item})
          }} />)}
          onRefresh={() => {
            setLoading(true)
            loadPakets()
            setLoading(false)
          }}
          refreshing={isLoading}
          ListEmptyComponent={() => <View><Text style={{textAlign: 'center'}}>Anda belum memiliki paket pembelajaran{'\n'}Beli paket sekarang juga!!</Text></View>}
        />
      </View>
      <Image style={{marginLeft: 20, marginTop: 10, marginBottom: 20, width: '90%', height: '25%', backgroundColor: 'rgba(37,144,191,0.07)', borderRadius: 10}} source={require('../assets/images/banner.png')} />
    </View>
  );
}

function BeliPaketScreen({navigation}) {
  const [modalVisible, setModalVisible] = React.useState(false)
  const [isLoading, setLoading] = React.useState(false)
  const [pakets, setPakets] = React.useState([])
  const [page, setPage] = React.useState(1)
  const [lastPage, setLastPage] = React.useState(1)
  const [bodyForm, setBody] = React.useState({})

  const loadContent = (page: number) => {
    setLoading(true)
    let _page = 1
    if (page > _page) {
      _page = page
    }
    fetch(API_URL+`/api/paket?page=${_page}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${User.token}`
      }
    }).then(res => res.json())
    .then(data => {
      setLastPage(data.last_page)
      if (data.data) {
        setPakets(data.data)
        setPage(_page)
      }
      setLoading(false)
    })
    .catch(err => {
      console.log(err)
    })
  }

  const loadImage = async () => {
    let image = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
    })
    if (!image.cancelled) {
      setBody({...bodyForm, image: 'data:image/jpeg;base64,' + image.base64})
    }
  }

  React.useEffect(() => loadContent(1), [])
  
  return (
    <View style={styles.container}>
      <LinearGradient style={{paddingTop: 50}} colors={['#3C8BE7','#00EAFF']} start={[1,1]} end={[0,0]}>
        <HeaderBackButton
          tintColor="#FFFFFF"
          style={{marginLeft: 30, padding: 5, backgroundColor: '#65C9F5', alignSelf: "flex-start", borderRadius: 10}}
          onPress={() => navigation.pop()}
        />
        <Text style={{...styles.title, textAlign: 'center', marginTop: 15, marginBottom: 30,}}>Pilih Paket Belajar{'\n'}Yang Cocok Buatmu</Text>
      </LinearGradient>
      <FlatList 
        data={pakets}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item, index}) => (<BeliPaket onPress={() => {
          setModalVisible(true)
          setBody({...bodyForm, paket_id: item.id})
        }} item={item} key={index} />)}
        onRefresh={() => {
          setLoading(true)
          loadContent(page)
          setLoading(false)
        }}
        refreshing={isLoading}
        ListFooterComponent={() => (<View style={{flexDirection: 'row', justifyContent: 'center'}}>
          <TouchableOpacity style={{paddingHorizontal: 20, paddingVertical: 10, margin: 10, backgroundColor: '#13CBF8', borderRadius: 10, opacity: page == 1? 0.5 : 1}}
            onPress={() => loadContent(page-1)}
            disabled={page == 1}
          >
            <Text style={{color: '#ffffff'}}>Prev</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{paddingHorizontal: 20, paddingVertical: 10, margin: 10, backgroundColor: '#13CBF8', borderRadius: 10, opacity: page == lastPage? 0.5 : 1}}
            onPress={() => loadContent(page+1)}
            disabled={page == lastPage}
          >
            <Text style={{color: '#ffffff'}}>Next</Text>
          </TouchableOpacity>
        </View>)}
      />
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible)
        }}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(!modalVisible)}>
        <View style={{flex: 1, alignItems: 'stretch', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <TouchableWithoutFeedback>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{
              'Transfer ke rekening xxxxxxxx\n' + 
              'senilai' + '150.000' + '\n' +
              'lalu upload bukti pembarayan disini'
            }</Text>
            <TouchableOpacity onPress={loadImage}>
              <Text style={{color: '#305F72', fontWeight: '700', textDecorationLine: 'underline'}}>Pilih gambar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{backgroundColor: '#305F72', paddingVertical: 10, paddingHorizontal: 30, margin: 20, borderRadius: 10}}
              onPress={()=> {
                setLoading(true)
                fetch(API_URL+`/api/paket/buy`, {
                  method: 'POST',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${User.token}`
                  },
                  body: JSON.stringify(bodyForm),
                  }).then(res => res.json())
                  .then(data => {
                    if (data.message) {
                      Alert.alert(data.message)
                    }
                    setLoading(false)
                    setModalVisible(false)
                  })
                  .catch(err => {
                    console.log(err)
                    Alert.alert('Terjadi kesalahan.')
                  })
              }}
            >
              <Text style={{fontWeight: 'bold', fontSize: 16, color: 'white'}}>Kirim</Text>
            </TouchableOpacity>
          </View>
          </TouchableWithoutFeedback>
        </View>
        </TouchableWithoutFeedback>
      </Modal>
      {isLoading?<ActivityIndicator
      animating={true}
      style={styles.indicator}
      size="large"
      color="#ffffff" />:null}
    </View>
  )
}

function PengaturanScreen({navigation}) {
  const [name, setName] = React.useState(User.name);
  const [email, setEmail] = React.useState(User.email);
  const [isLoading, setLoading] = React.useState(false);
  const [photo, setPhoto] = React.useState({});
  const { signOut } = React.useContext(AuthContext);

  const loadImage = async () => {
    let image = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
    })
    if (!image.cancelled) {
      let filename = image.uri.split('/').pop();

      // Infer the type of the image
      let match = /\.(\w+)$/.exec(filename);
      let type = match ? `image/${match[1]}` : `image`
      setPhoto({ uri: image.uri, name: filename, type})
    }
  }

  let updateProfile = async (data: Object) => {
      setLoading(true)
      let formdata = new FormData();
      formdata.append('name', name);
      formdata.append('email', email);
      if (photo.uri) {
        formdata.append('photo', photo)
      }
      console.log(formdata)
      let response = await fetch(API_URL+'/api/auth/update', {
          method: 'POST',
          headers: {
              Accept: 'application/json',
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${User.token}`
          },
          body: formdata
      }). then( res => res.json())
      .catch(err => {
          Alert.alert("Maaf terjadi kesalahan.")
          console.log(err)
      })
      if (response) {
        console.log(response)
        User.name = response.user.name
        User.email = response.user.email
        setLoading(false)
        navigation.pop()
        return null
      }
      setLoading(false)
  }

  return (
    <View style={styles.container}>
      <LinearGradient style={{paddingTop: 50}} colors={['#3C8BE7','#00EAFF']} start={[1,1]} end={[0,0]}>
        <HeaderBackButton
          tintColor="#FFFFFF"
          style={{marginLeft: 30, padding: 5, backgroundColor: '#65C9F5', alignSelf: "flex-start", borderRadius: 10}}
          onPress={() => navigation.pop()}
        />
        <Text style={{...styles.title, textAlign: 'center', marginTop: 15, marginBottom: 30,}}>Pengaturan</Text>
      </LinearGradient>
      <View style={{alignContent: 'center', justifyContent: 'center', padding: 20, width: '100%'}}>
        <NormalText style={{fontSize: 20, fontWeight: 'bold', color: 'black', margin: 20}}>
          Profile Information
        </NormalText>
        <Image source={{uri: photo.uri?photo.uri:User.profile_photo_url}} style={{width: 100, height: 100, resizeMode: 'cover', marginLeft: 20}} />
        <TouchableOpacity style={{marginLeft: 20}} onPress={loadImage}>
          <Text style={{color: '#305F72', fontWeight: '700', textDecorationLine: 'underline'}}>Pilih gambar</Text>
        </TouchableOpacity>
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.TextInput}
                placeholder="Nama."
                placeholderTextColor="#E3EDE1"
                autoCapitalize="none"
                onChangeText={(name) => setName(name)}
                value={name}
                defaultValue={name}
            />
        </View>
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.TextInput}
                placeholder="Email."
                placeholderTextColor="#E3EDE1"
                autoCapitalize="none"
                onChangeText={(email) => setEmail(email)}
                value={email}
                defaultValue={email}
            />
        </View>
        <TouchableOpacity onPress={async () => updateProfile({name: name, email: email,})} style={styles.link}>
            <Text style={styles.linkText}>SIMPAN</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={async () => signOut()} style={{...styles.link, backgroundColor: 'red'}}>
            <Text style={styles.linkText}>KELUAR</Text>
        </TouchableOpacity>
      </View>
      {/* <View style={styles.inputContainer}>
          <TextInput
              style={styles.TextInput}
              placeholder="Current password."
              placeholderTextColor="#E3EDE1"
              autoCapitalize="none"
              secureTextEntry={true}
              onChangeText={(password) => setPassword(password)}
          />
      </View>
      <View style={styles.inputContainer}>
          <TextInput
              style={styles.TextInput}
              placeholder="Password."
              placeholderTextColor="#E3EDE1"
              autoCapitalize="none"
              secureTextEntry={true}
              onChangeText={(password) => setPassword(password)}
          />
      </View>
      <View style={styles.inputContainer}>
          <TextInput
              style={styles.TextInput}
              placeholder="Confirm password."
              placeholderTextColor="#E3EDE1"
              autoCapitalize="none"
              secureTextEntry={true}
              onChangeText={(password) => setPasswordConfirmation(password)}
          />
      </View>
      <TouchableOpacity onPress={async () => signUp (await register({name: name, email: email, password: password, password_confirmation: passwordConfirmation}))} style={styles.link}>
          <Text style={styles.linkText}>DAFTAR</Text>
      </TouchableOpacity> */}
    {isLoading?<ActivityIndicator
      animating={true}
      style={styles.indicator}
      size="large"
      color="#ffffff" />:null}
  </View>
  )
}

function BeliPaket(props: {key: number, onPress: any, item: any}) {
  return (
    <TouchableOpacity style={{borderStyle: "dashed", borderWidth: 2, borderColor: '#D5D5D5', borderRadius: 20, marginVertical: 10, marginHorizontal: 20, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}
    {...props}
    >
      <View>
        <Text style={{fontSize: 16, fontWeight: 'bold', color: '#305F72'}}>{props.item.name}</Text>
        <Text style={{fontSize: 15, color: '#305F72'}}>{props.item.desc}</Text>
      </View>
      <Text style={{color: '#13CBF8', fontSize: 20, fontWeight: 'bold'}}>
        {props.item.price}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  openButton: {
    backgroundColor: '#F194FF',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    minHeight: '110%',
    marginTop: -10,
  },
  bgimg: {
    width: '100%',
    height: Dimensions.get("window").height / 2.1,
    marginTop: 0,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    margin: 20,
    marginTop: 40,
    color: '#FFFFFF',
  },
  avatar: {
    width: Dimensions.get("window").width / 4,
    height: Dimensions.get("window").width / 4,
    borderRadius: Dimensions.get("window").width / 8,
  },
  profile: {
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonContainer: {
    marginLeft: Dimensions.get("window").width * 0.05,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: Dimensions.get("window").width * 0.50
  },
  button: {
    padding: 5,
    flexBasis: Dimensions.get("window").width * 0.16,
    alignContent: 'center',
  },
  icon: {
    fontSize: 30,
    color: '#FFFFFF',
    backgroundColor: '#1AC1F5',
    borderRadius: 10,
    padding: 10,
    textAlign: 'center',
  },
  learn: {
    marginLeft: 20,
    marginRight: 20,
    height: Dimensions.get("window").height / 4,
    borderRadius: 20,
    overflow: 'hidden',
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
  link: {
      marginTop: 15,
      paddingVertical: 15,
      width: Dimensions.get("window").width / 1.2,
      backgroundColor: '#319CEC',
      borderRadius: 30,
  },
  linkText: {
      fontSize: 14,
      color: '#ffffff',
      textAlign: 'center',
  },
  inputContainer: {
      shadowColor: '#E3EDE1',
      shadowRadius: 10,
      shadowOffset: {
          width: 10,
          height: 10,
      },
      elevation: 3,
      margin: 10,
      paddingHorizontal: 20,
      paddingVertical: 10,
      width: Dimensions.get("window").width / 1.2,
      backgroundColor: '#fff',
      borderRadius: 10,
  },
  TextInput: {
      color: '#205072',
  },
});

import { StackScreenProps } from '@react-navigation/stack';
import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ImageBackground, TextInput, Dimensions, Alert, ActivityIndicator } from 'react-native';

import { RootStackParamList } from '../types';
import { API_URL } from "../constants/ENV";
import { AuthContext } from '../constants/context';
import * as SecureStore from 'expo-secure-store';

export default function RegisterScreen({
  navigation,
}: StackScreenProps<RootStackParamList, 'NotFound'>) {
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [passwordConfirmation, setPasswordConfirmation] = React.useState('');
    const [isLoading, setLoading] = React.useState(false);
    
    const [err, setErr] = React.useState('');
    
    const { signUp } = React.useContext(AuthContext);

    let register = async (data: Object) => {
        setLoading(true)
        let response = await fetch(API_URL+'/api/auth/signup', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }). then( res => res.json())
        .catch(err => {
            Alert.alert("Maaf terjadi kesalahan.")
            console.log(err)
        })
        if (response && response.message) {
            let errMSG = response.message
            for (const key in response.errors) {
                if (Object.prototype.hasOwnProperty.call(response.errors, key)) {
                    const val = response.errors[key];
                    errMSG += '\n' + val
                }
            }
            setErr(errMSG)
            setLoading(false)
            return null
        }
        else if (response) {
            SecureStore.setItemAsync('access_token',response.access_token)
            return response
        }
        setLoading(false)
    }

    return (
        <>
        <View style={styles.container}>
            <ImageBackground source={require('../assets/images/icon-blue.png')} imageStyle={{opacity: 0.1}} resizeMode="contain" style={styles.head}>
                <Text style={styles.title}>Daftar</Text>
                <Text style={styles.subtitle}>Pengguna baru?{"\n"}Daftarkan akunmu sekarang!</Text>
            </ImageBackground>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.TextInput}
                    placeholder="Nama."
                    placeholderTextColor="#E3EDE1"
                    autoCapitalize="none"
                    onChangeText={(name) => setName(name)}
                />
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.TextInput}
                    placeholder="Email."
                    placeholderTextColor="#E3EDE1"
                    autoCapitalize="none"
                    onChangeText={(email) => setEmail(email)}
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
            {err ? (<Text style={styles.err}>{err}</Text>) : null}
            <TouchableOpacity onPress={async () => signUp (await register({name: name, email: email, password: password, password_confirmation: passwordConfirmation}))} style={styles.link}>
                <Text style={styles.linkText}>DAFTAR</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.link2}>
                <Text style={styles.linkText2}>Pernah mendaftar? Masuk sekarang!</Text>
            </TouchableOpacity>
        </View>
        {isLoading?<ActivityIndicator
            animating={true}
            style={styles.indicator}
            size="large"
            color="#ffffff" />:null}
        </>
    );
}

const styles = StyleSheet.create({
    head: {
        width: 200,
        height: 200,
        justifyContent: 'flex-end',
        marginBottom: 30,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 25,
        fontWeight: '100',
        textAlign: 'center',
        marginBottom: 15,
        color: '#205072',
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 15,
        color: '#205072',
        opacity: 0.5
    },
    link: {
        marginTop: 15,
        paddingVertical: 15,
        width: Dimensions.get("window").width / 1.5,
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
        width: Dimensions.get("window").width / 1.5,
        backgroundColor: '#fff',
        borderRadius: 10,
    },
    TextInput: {
        color: '#205072',
    },
    err: {
        color: '#eb4034',
        fontSize: 10,
    },
    link2: {
      marginTop: 15,
      paddingVertical: 15,
    },
    linkText2: {
      fontSize: 14,
      color: '#2e78b7',
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

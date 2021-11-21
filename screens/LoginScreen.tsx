import { StackScreenProps } from '@react-navigation/stack';
import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ImageBackground, TextInput, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { API_URL } from '../constants/ENV';

import { RootStackParamList } from '../types';
import * as SecureStore from 'expo-secure-store';
import { AuthContext } from '../constants/context';

export default function LoginScreen({
  navigation,
}: StackScreenProps<RootStackParamList, 'Login'>) {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [err, setErr] = React.useState('');
    const [isLoading, setLoading] = React.useState(false);
    const { signIn } = React.useContext(AuthContext);

    let login = async () => {
        setLoading(true)
        let response = await fetch(API_URL+'/api/auth/login', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        }). then( res => res.json())
        .catch(err => Alert.alert('Terjadi kesalahan.'))
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
            // Alert.alert(response.access_token)
            setErr('')
            SecureStore.setItemAsync('access_token',response.access_token)
            return response
        }
        setLoading(false)
    }

    return (
        <><View style={styles.container}>
            <ImageBackground source={require('../assets/images/icon-blue.png')} imageStyle={{ opacity: 0.1 }} resizeMode="contain" style={styles.head}>
                <Text style={styles.title}>Masuk</Text>
                <Text style={styles.subtitle}>Masukan informasi untuk{"\n"}mengakses akunmu</Text>
            </ImageBackground>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.TextInput}
                    placeholder="Email."
                    placeholderTextColor="#E3EDE1"
                    autoCapitalize="none"
                    onChangeText={(email) => setEmail(email)} />
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.TextInput}
                    placeholder="Password."
                    placeholderTextColor="#E3EDE1"
                    secureTextEntry={true}
                    autoCapitalize="none"
                    onChangeText={(password) => setPassword(password)} />
            </View>
            {err ? (<Text style={styles.err}>{err}</Text>) : null}
            <TouchableOpacity onPress={async () => { signIn(await login()); } } style={styles.link}>
                <Text style={styles.linkText}>MASUK</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.replace('Root')} style={styles.link2}>
                <Text style={styles.linkText2}>Belum punya akun? Daftar!</Text>
            </TouchableOpacity>
        </View>{isLoading?<ActivityIndicator
                animating={true}
                style={styles.indicator}
                size="large"
                color="#ffffff" />:null}</>
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
    link2: {
      marginTop: 15,
      paddingVertical: 15,
    },
    linkText2: {
      fontSize: 14,
      color: '#2e78b7',
    },
    err: {
        color: '#eb4034',
        fontSize: 10,
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

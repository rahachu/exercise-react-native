/**
 * If you are not familiar with React Navigation, check out the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { ActivityIndicator, Alert, ColorSchemeName } from 'react-native';
import RegisterScreen from '../screens/RegisterScreen';

import NotFoundScreen from '../screens/NotFoundScreen';
import { RootStackParamList } from '../types';
import BottomTabNavigator from './BottomTabNavigator';
import LinkingConfiguration from './LinkingConfiguration';
import * as SecureStore from 'expo-secure-store';
import LoginScreen from '../screens/LoginScreen';
import { AuthContext, User } from '../constants/context';
import { API_URL } from '../constants/ENV';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotVerifiedScreen from '../screens/NotVerified';

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const Stack = createStackNavigator<RootStackParamList>();

function RootNavigator() {
  const [state, dispatch] = React.useReducer(
    (prevState: any, action: any) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
    }
  );

  React.useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      let userToken;

      try {
        userToken = await SecureStore.getItemAsync('access_token');
        if (userToken) {
          let user = await fetch(API_URL+'/api/auth/user',{
            headers: {
              Authorization: 'Bearer '+userToken
            }
          }).then (res => res.json())
          Object.assign(User, {...user, token: userToken})
        }
      } catch (e) {
        Alert.alert("Something Error!!!")
        userToken = null
      }

      // After restoring token, we may need to validate it in production apps

      // This will switch to the App screen or Auth screen and this loading
      // screen will be unmounted and thrown away.
      dispatch({ type: 'RESTORE_TOKEN', token: userToken });
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async (data: {user: Object, access_token: string}) => {
        if (!data) {
          return
        }
        Object.assign(User,{...data.user, token: data.access_token})
        dispatch({ type: 'SIGN_IN', token: data.access_token });
      },
      signOut: () => {
        SecureStore.deleteItemAsync('access_token')
        AsyncStorage.clear()
        dispatch({ type: 'SIGN_OUT' })
      },
      signUp: async (data: {user: Object, access_token: string}) => {
        if (!data) {
          return
        }
        Object.assign(User,{...data.user, token: data.access_token})
        dispatch({ type: 'SIGN_IN', token: data.access_token });
      },
    }),
    []
  );
  if (state.isLoading) {
    return <ActivityIndicator
      animating={true}
      style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center'
        }}
      size="large"
      color="#0000ff" />
  }
  return (
    <AuthContext.Provider value={authContext}>
      <Stack.Navigator screenOptions={{ headerShown: false, headerTransparent: true }}>
        {(state.userToken == null) ? (
            <>
              <Stack.Screen name="Root" component={RegisterScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
            </>
          ) : (
            <>
              {(User.email_verified_at) ? 
              (
                <>
                <Stack.Screen name="Root" component={BottomTabNavigator} />
                <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
                </>
              )
              :
              (
                <Stack.Screen name="NotFound" component={NotVerifiedScreen} options={{ title: 'Oops!' }} />
              )
              }
            </>
        )}
      </Stack.Navigator>
    </AuthContext.Provider>
  );
}

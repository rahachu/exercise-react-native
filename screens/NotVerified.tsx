import { StackScreenProps } from '@react-navigation/stack';
import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../constants/context';

import { RootStackParamList } from '../types';

export default function NotVerifiedScreen({
  navigation,
}: StackScreenProps<RootStackParamList, 'NotFound'>) {
  const { signOut } = React.useContext(AuthContext);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your account not verified. Check your email!!</Text>
      <TouchableOpacity onPress={() => signOut()} style={styles.link}>
        <Text style={styles.linkText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});

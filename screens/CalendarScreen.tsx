import { useIsFocused } from '@react-navigation/native';
import * as React from 'react';
import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Dimensions, StatusBar, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { CalendarList } from 'react-native-calendars'
import { LinearGradient } from 'expo-linear-gradient'
import { API_URL } from '../constants/ENV';

export default function CalendarScreen() {
  const [events, setEvents] = React.useState([]);

  const loadEvents = (year = 0, month = 0) => {
    let isMounted = true
    fetch(API_URL+`/api/event/${year?year:(new Date()).getFullYear()}/${month?month:(new Date()).getMonth() + 1}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    }).then(res => res.json())
    .then(data => {
      if (data) {
        if (isMounted) {
          setEvents(data)
        }
        console.log(API_URL+`/api/event/${year?year:(new Date()).getFullYear()}/${month?month:(new Date()).getMonth() + 1}`)
        console.log(data)
      }
    })
    .catch(err => {
      Alert.alert('Terjadi kesalahan, tunggu beberapa saat.')
      console.log(err)
    })
    return () => {isMounted = false}
  }

  React.useEffect(() => loadEvents(), [])

  const isFocused = useIsFocused()
  return (
    <View style={styles.container}>
      {isFocused? <StatusBar translucent={true} barStyle="light-content" /> : null}
      <LinearGradient colors={['#3C8BE7','#00EAFF']} start={[1,1]} end={[0,0]}>
        <Text style={styles.title}>Calendar</Text>
      </LinearGradient>
      <View style={{height: Dimensions.get('screen').height / 2.5}}>
        <CalendarList
          horizontal={true}
          pagingEnabled={true}
          calendarHeight={Dimensions.get('screen').width}
          onVisibleMonthsChange={month => loadEvents(month[0].year, month[0].month)}
        />
      </View>
      <FlatList
        data={events}
        renderItem={({item}) => <Event tanda={item} />}
        ListEmptyComponent={()=><Text style={{margin: 20}}>Belum ada event</Text>}
        style={{alignSelf: 'stretch', backgroundColor: '#E9F8FF'}}
        keyExtractor={item => item.name}
      />
    </View>
  );
}

function Event(props: {tanda: any}) {
  const tanggal = new Date(props.tanda.event_at)
  const month = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return (
    <View style={{flexDirection: 'row', justifyContent: 'flex-start', margin: 5,}}>
      <Text style={{textAlign: 'center', padding: 20}}>{tanggal.getDate()+'\n'+month[tanggal.getMonth()]}</Text>
      <View style={{borderLeftColor: '#3C8BE7', borderLeftWidth: 2, flexGrow: 1, justifyContent: 'center', padding: 20}}>
        <Text>{props.tanda.name}</Text>
        <Text>{props.tanda.clock + ' WIB'}</Text>
      </View>
    </View>
  )  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#ffffff',
    // backgroundColor: '#00EAFF',
    paddingVertical: 50,
    width: Dimensions.get('screen').width,
    textAlign: 'center',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
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

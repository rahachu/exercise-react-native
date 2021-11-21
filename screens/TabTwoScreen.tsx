import * as React from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../constants/ENV';
import { User } from '../constants/context';

export default function TabTwoScreen({navigation}) {
  const [questions, setQuestions] = React.useState([])
  const [isLoading, setLoading] = React.useState(false)
  const [query, setQuery] = React.useState('')

  const searchQuestion = () => {
    setLoading(true)
    fetch(API_URL+`/api/qna/search`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${User.token}`
      },
      body: JSON.stringify({
        search: query
      })
    }).then(res => res.json())
    .then(data => {
      setQuestions(data)
    })
    .catch(err => {
      console.log(err)
    })
  }

  const renderItem = ({ item, index }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardContent}>{item.content.replace(/(<([^>]+)>)/ig, '')}</Text>
      <TouchableOpacity onPress={() => navigation.navigate('QNA', {screen: 'Question', params: {question_id: item.id}, initial: false})} style={{...styles.link, alignSelf: 'flex-end'}}>
          <Text style={styles.linkText}>Lihat lebih lanjut</Text>
      </TouchableOpacity>
    </View>)

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput style={styles.searchBox} value={query} onChangeText={setQuery} placeholder="Cari pertanyaan" />
        <TouchableOpacity onPress={searchQuestion}>
          <Ionicons name="search-circle-outline" style={styles.searchButton}/>
        </TouchableOpacity>
      </View>
      <FlatList
          data={questions}
          renderItem={renderItem}
          keyExtractor={item => item.title}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  searchContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
  },
  searchBox: {
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
  searchButton: {
    color: '#319CEC',
    fontSize: 40,
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
});

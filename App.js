import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, TextInput, Button
} from 'react-native'

import { API, graphqlOperation } from 'aws-amplify'
import { createTodo } from './src/graphql/mutations'
import { listTodos } from './src/graphql/queries'
import Amplify from 'aws-amplify'
import config from './src/aws-exports'
import SvgQRCode from 'react-native-qrcode-svg'

import QRScanner from './src/components/QRScanner'

Amplify.configure(config)

const initialState = { name: '', description: '' }

const App = () => {
  const [formState, setFormState] = useState(initialState)
  const [todos, setTodos] = useState([])

  useEffect(() => {}, [])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  return (
    <View style={styles.container}>
      <QRScanner style={styles.qrscanner} />
      <SvgQRCode
        value={'yayyyyyy'}
      />
      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 20,
    paddingRight: 20,
  },
  qrscanner: {
    flex: 1,
  },
  todo: {
    marginBottom: 15
  },
  input: {
    height: 50,
    backgroundColor: '#ddd',
    marginBottom: 10,
    padding: 8
  },
  todoName: { 
    fontSize: 18
  }
})

export default App
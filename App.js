import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, TextInput, Button
} from 'react-native'

import Amplify, { Auth } from 'aws-amplify'
import config from './src/aws-exports'

import QRScanner from './src/components/QRScanner'
import UserVoucherListTab from './src/components/UserVoucherListTab'
import StoreVouchers from './src/components/StoreVouchers'
import { NavigationContainer } from '@react-navigation/native';
import { getHeaderTitle } from '@react-navigation/elements';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';

import { withAuthenticator, AmplifyTheme } from 'aws-amplify-react-native'


Amplify.configure({
  ...config,
  Analytics: {
    disabled: true,
  },
  Auth: {
    mandatorySignIn: true,
  }
})

console.log(Auth.configure())

const initialState = { name: '', description: '' }
const Tab = createMaterialBottomTabNavigator();
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const App = () => {
  const [formState, setFormState] = useState(initialState)
  const [todos, setTodos] = useState([])

  const setInput = (key, value) => {
    setFormState({ ...formState, [key]: value })
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName='StoreVouchers'
        activeColor='white'
        barStyle={{ backgroundColor: '#003B70' }}
      >
        <Tab.Screen
          name='Scan QR Code'
          component={QRScanner}
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                name='qrcode'
                color={color}
                size={26}
              />
            )
          }}
        />
        <Tab.Screen
          name='UserVoucherListTab'
          component={UserVoucherListTab}
          options={{
            title: 'My Vouchers',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                name='ticket-confirmation'
                color={color}
                size={26}
              />
            )
          }}
        />
        <Tab.Screen
          name='StoreVouchers'
          component={StoreVouchers}
          options={{
            title: 'Store Vouchers',
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                name='store'
                color={color}
                size={26}
              />
            )
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
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


// Authenticator Theming
const MyButton = Object.assign({}, AmplifyTheme.button, {
  alignItems: 'center',
  padding: 16,
  backgroundColor: '#003B70'
});
const MyButtonDisabled = Object.assign({}, AmplifyTheme.buttonDisabled, { 
  alignItems: 'center',
  padding: 16,
  backgroundColor: '#496075',
});
const MySectionFooterLink = Object.assign({}, AmplifyTheme.sectionFooterLink, { 
  fontSize: 14,
  color: '#003B70',
  alignItems: 'baseline',
  textAlign: 'center',
});
const MyTheme = Object.assign({}, AmplifyTheme, { button: MyButton, buttonDisabled: MyButtonDisabled, sectionFooterLink: MySectionFooterLink });

export default withAuthenticator(App, {
  theme: MyTheme,
  signUpConfig: {
    hiddenDefaults: ['phone_number'],
    signUpFields: [{key: 'preferred_username', label: 'Display Name (Optional)', required: false} ]
  }
})

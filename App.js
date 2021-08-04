import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, TextInput, Button, Image
} from 'react-native'

import { NavigationContainer } from '@react-navigation/native';
import { getHeaderTitle } from '@react-navigation/elements';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Amplify, { Auth } from 'aws-amplify'
import { DataStore } from "@aws-amplify/datastore"

import { withAuthenticator, AmplifyTheme, SignIn, SignUp, ForgotPassword, ConfirmSignUp } from 'aws-amplify-react-native'

import config from './src/aws-exports'
import { GiftVoucher, StoreProfile } from './src/models';
import QRScanner from './src/components/QRScanner'
import UserVoucherListTab from './src/components/UserVoucherListTab'
import StoreVouchers from './src/components/StoreVouchers'
import CustomConfirmSignUp from './src/components/CustomConfirmSignUp'
import LoginHeader from './src/components/LoginHeader'
import StoreManagement from './src/components/StoreManagement'

Amplify.configure({
  ...config,
  Analytics: {
    disabled: true,
  },
  Auth: {
    mandatorySignIn: true,
  }
})

const initialState = { name: '', description: '' }
const Tab = createMaterialBottomTabNavigator();

const App = () => {
  const [formState, setFormState] = useState(initialState)
  const [isStore, setIsStore] = useState(false)

  useEffect(() => {
    const getProfile = async () => {
      const user = await Auth.currentAuthenticatedUser();
      const username = user.username.toLowerCase();
      const storeProfileQuery = await DataStore.query(StoreProfile, c => c.username('eq', username))
      if (storeProfileQuery.length > 0) {
        setIsStore(true)
      } else {
        setIsStore(false)
      }
    }
    getProfile()
  }, [])

  const setInput = (key, value) => {
    setFormState({ ...formState, [key]: value })
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName={isStore ? 'StoreManagement' : 'StoreVouchers'}
        activeColor='#003B70'
        barStyle={styles.bar}
        shifting={true}
      >
        <Tab.Screen
          name='StoreVouchers'
          component={StoreVouchers}
          options={{
            title: 'Store',
            tabBarIcon: ({ focused, color }) => (
              <MaterialCommunityIcons
                name={
                  focused
                    ? 'store'
                    : 'store-outline'
                }
                color={color}
                size={26}
              />
            )
          }}
        />
        <Tab.Screen
          name='Scan'
          component={QRScanner}
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                name='qrcode-scan'
                color={color}
                size={20}
              />
            )
          }}
        />
        {
          isStore ? (
            <Tab.Screen
              name="StoreManagement"
              component={StoreManagement}
              options={{
                title: 'Manage',
                tabBarIcon: ({ focused, color }) => (
                  <MaterialCommunityIcons
                    name={
                      focused
                        ? 'store'
                        : 'store-outline'
                    }
                    color={color}
                    size={26}
                  />
                )
              }}
            />
          ) : (
            <Tab.Screen
              name='UserVoucherListTab'
              component={UserVoucherListTab}
              options={{
                title: 'Vouchers',
                tabBarIcon: ({ focused, color }) => (
                  <MaterialCommunityIcons
                    name={
                      focused
                        ? 'ticket-confirmation'
                        : 'ticket-confirmation-outline'
                    }
                    color={color}
                    size={26}
                  />
                )
              }}
            />
          )
        }
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
  },
  bar: {
    backgroundColor: '#FFF',
  }
})


// Authenticator Theming
const MyButton = Object.assign({}, AmplifyTheme.button, {
  alignItems: 'center',
  padding: 16,
  backgroundColor: '#003B70',
  borderRadius: 8
});
const MyButtonDisabled = Object.assign({}, AmplifyTheme.buttonDisabled, {
  alignItems: 'center',
  padding: 16,
  backgroundColor: '#496075',
  borderRadius: 8
});
const MySectionFooterLink = Object.assign({}, AmplifyTheme.sectionFooterLink, {
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 10,
  color: '#003B70',
  textAlign: 'center',
});
const Section = Object.assign({}, AmplifyTheme.section, {
  flex: 1,
  width: '100%',
  paddingHorizontal: '10%',
  justifyContent: 'space-between',
  paddingHorizontal: 20,
});
const MyTheme = Object.assign({}, AmplifyTheme, {
  section: Section,
  button: MyButton,
  buttonDisabled: MyButtonDisabled,
  sectionFooterLink: MySectionFooterLink
});

export default withAuthenticator(App, {
  theme: MyTheme,
  authenticatorComponents: [
    <StatusBar barStyle='dark-content' />,
    <LoginHeader />,
    <SignIn />,
    <SignUp signUpConfig={{
      hiddenDefaults: ['phone_number'],
      signUpFields: [{ name: 'preferred_username', key: 'preferred_username', label: 'Display Name (Optional)', required: false }]
    }} />,
    <ForgotPassword />,
    <CustomConfirmSignUp />
  ]
})

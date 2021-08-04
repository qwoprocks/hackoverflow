import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react'
import {
  View, Text, StyleSheet, TextInput, Button, Image
} from 'react-native'

import Amplify, { Auth } from 'aws-amplify'
import config from './src/aws-exports'
import { DataStore } from "@aws-amplify/datastore"

import QRScanner from './src/components/QRScanner'
import UserVoucherListTab from './src/components/UserVoucherListTab'
import StoreVouchers from './src/components/StoreVouchers'
import { NavigationContainer } from '@react-navigation/native';
import { getHeaderTitle } from '@react-navigation/elements';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { GiftVoucher, StoreProfile } from './src/models';

import { withAuthenticator, AmplifyTheme, SignIn, SignUp, ForgotPassword, ConfirmSignUp } from 'aws-amplify-react-native'

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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const App = () => {
  const [formState, setFormState] = useState(initialState)
  const [todos, setTodos] = useState([])
  const [isStore, setIsStore] = useState(false)

  useEffect(() => {
    (async () => {
      const user = await Auth.currentAuthenticatedUser();
      const username = user.signInUserSession.accessToken.payload.username.toLowerCase();
      const storeProfileQuery = await DataStore.query(StoreProfile, c => c.username('eq', username));
      if (storeProfileQuery.length > 0) {
        setIsStore(true)
      } else {
        setIsStore(false)
      }
    })();
  }, [])

  const setInput = (key, value) => {
    setFormState({ ...formState, [key]: value })
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName='StoreManagement'
        activeColor='#003B70'
        barStyle={styles.bar}
        shifting={true}
      >
        {
          !isStore && <Tab.Screen
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
        }
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
        {
          isStore && <Tab.Screen
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

import { UserProfile } from './src/models'
import { I18n, Logger } from 'aws-amplify';
import {
  AuthPiece, IAuthPieceProps, IAuthPieceState,
  FormField,
  LinkCell,
  Header,
  ErrorRow,
  AmplifyButton,
  SignedOutMessage,
  Wrapper
} from 'aws-amplify-react-native';
import StoreManagement from './src/components/StoreManagement';

const logger = new Logger('ConfirmSignUp');

interface IConfirmSignUpProps extends IAuthPieceProps { }

interface IConfirmSignUpState extends IAuthPieceState {
  code: string | null;
}

class MyConfirmSignUp extends AuthPiece<
  IConfirmSignUpProps,
  IConfirmSignUpState
> {
  constructor(props: IConfirmSignUpProps) {
    super(props);

    this._validAuthStates = ['confirmSignUp'];
    this.state = {
      username: null,
      code: null,
      error: null,
    };

    this.confirm = this.confirm.bind(this);
    this.resend = this.resend.bind(this);
  }

  confirm() {
    const { code } = this.state;
    const username = this.getUsernameFromInput();
    logger.debug('Confirm Sign Up for ' + username);
    Auth.confirmSignUp(username, code)
      .then(async (data) => {
        this.changeState('signedUp')
        try {
          const userData = await DataStore.save(
            new UserProfile({
              username: username.toLowerCase(),
              money: 0,
            })
          )
        } catch (error) {
          console.error(error)
        }
      })
      .catch(err => this.error(err));
  }

  resend() {
    const username = this.getUsernameFromInput();
    logger.debug('Resend Sign Up for ' + username);
    Auth.resendSignUp(username)
      .then(() => logger.debug('code sent'))
      .catch(err => this.error(err));
  }

  static getDerivedStateFromProps(props, state) {
    const username = props.authData;

    if (username && !state.username) {
      return { [props.usernameAttributes]: username };
    }

    return null;
  }

  showComponent(theme) {
    const username = this.getUsernameFromInput();
    return (
      <Wrapper>
        <View style={theme.section}>
          <View>
            <Header theme={theme}>
              {I18n.get('Confirm Sign Up')}
            </Header>
            <View style={theme.sectionBody}>
              {this.renderUsernameField(theme)}
              <FormField
                theme={theme}
                onChangeText={text => this.setState({ code: text })}
                label={I18n.get('Confirmation Code')}
                placeholder={I18n.get('Enter your confirmation code')}
                required={true}
              />
              <AmplifyButton
                theme={theme}
                text={I18n.get('Confirm')}
                onPress={this.confirm}
                disabled={!username || !this.state.code}
              />
            </View>
            <View style={theme.sectionFooter}>
              <LinkCell
                theme={theme}
                onPress={this.resend}
                disabled={!this.state.username}
              >
                {I18n.get('Resend code')}
              </LinkCell>
              <LinkCell
                theme={theme}
                onPress={() => this.changeState('signIn')}
              >
                {I18n.get('Back to Sign In')}
              </LinkCell>
            </View>
            <ErrorRow theme={theme}>{this.state.error}</ErrorRow>
          </View>
          <SignedOutMessage {...this.props} />
        </View>
      </Wrapper>
    );
  }
}

function LoginHeader() {
  return (
    <View style={{ height: 180, marginTop: 80 }}>
      <Image
        source={require('./assets/qr-code-scan.png')}
        style={{ width: 100, height: 100, alignSelf: 'center' }}
      />
      <Text
        style={{ textAlign: 'center', marginTop: 20, fontSize: 24, fontWeight: '600' }}
      >
        QRPay
      </Text>
    </View>
  );
}

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
    <MyConfirmSignUp />
  ]
})

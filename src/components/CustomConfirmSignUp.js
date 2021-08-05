import React from 'react';
import { View } from 'react-native';
import { Auth, I18n } from 'aws-amplify';
import {
  AuthPiece,
  FormField,
  LinkCell,
  Header,
  ErrorRow,
  AmplifyButton,
  SignedOutMessage,
  Wrapper,
} from 'aws-amplify-react-native';
import { DataStore } from '@aws-amplify/datastore';

import { UserProfile } from '../models';

export default class CustomConfirmSignUp extends AuthPiece {
  constructor(props) {
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
    Auth.confirmSignUp(username, code)
      .then(async (data) => {
        this.changeState('signedUp');
        try {
          const userData = await DataStore.save(
            new UserProfile({
              username: username.toLowerCase(),
              money: 0,
            }),
          );
        } catch (error) {
          console.error(error);
        }
      })
      .catch((err) => this.error(err));
  }

  resend() {
    const username = this.getUsernameFromInput();
    Auth.resendSignUp(username)
      .catch((err) => this.error(err));
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
                onChangeText={(text) => this.setState({ code: text })}
                label={I18n.get('Confirmation Code')}
                placeholder={I18n.get('Enter your confirmation code')}
                required
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

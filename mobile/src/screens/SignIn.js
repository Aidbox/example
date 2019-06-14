import React from 'react';
import { Modal, Linking, Image } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { parse } from 'qs';
import { WebView } from 'react-native-webview';
import {
  Container,
  Content,
  Header,
  Left,
  Body,
  Icon,
  Right,
  Button,
  Text,
  Toast,
  Spinner,
  View
} from 'native-base';

import { post, getURL, getClientId, getRedirectUri } from '../lib/http';

import { getUserInfo } from '../lib/helpers';

import logo from '../../static/logo.png';

export default class SignInScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    header: null
  });

  state = {
    uri: null
  };

  componentDidMount() {
    const {
      navigation: { navigate }
    } = this.props;
    Linking.addEventListener('url', async ({ url }) => {
      if (url && url.length > 0 && url.includes('auth?code=')) {
        const clientId = await getClientId();
        const redirectUri = await getRedirectUri();
        const { code } = parse(url.replace(`${redirectUri}?`, ''));
        try {
          const p = {
            client_id: clientId,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
            code
          };
          const { data } = await post({
            url: '/auth/token',
            data: p
          });
          if (data && data.access_token) {
            await AsyncStorage.setItem('userToken', data.access_token);
            const user = await getUserInfo(data.access_token);
            if (
              user.data &&
              user.data.patient &&
              user.data.patient.length > 0
            ) {
              this.setState({ uri: null });
              navigate('App');
            } else {
              this.setState({ uri: null });
              navigate('PatientLoading');
            }
          }
        } catch (error) {
          this.setState({ uri: null });
          console.log(error, error.response);
          if (
            error.response &&
            error.response.data &&
            error.response.data.error_description
          ) {
            Toast.show({
              text: error.response.data.error_description,
              buttonText: 'OK'
            });
          } else {
            Toast.show({ text: error.message, buttonText: 'OK' });
          }
        }
      }
    });
  }

  _signInAsync = async () => {
    const url = await getURL();
    const clientId = await getClientId();
    const redirectUri = await getRedirectUri();
    const uri = [
      `${url}/auth/authorize`,
      '?response_type=code',
      `&client_id=${clientId}`,
      `&redirect_uri=${redirectUri}`
    ].join('');
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('patients');
    await AsyncStorage.removeItem('patient');
    this.setState({ uri });
  };

  modal() {
    const { uri } = this.state;
    return (
      <Modal animationType="slide" transparent={false} visible={uri !== null}>
        <Content>
          <Header style={{ backgroundColor: '#fff', borderBottomWidth: 0 }}>
            <Left />
            <Body />
            <Right>
              <Button transparent onPress={() => this.setState({ uri: null })}>
                <Icon style={{ color: '#333', opacity: 0.7 }} name="md-close" />
              </Button>
            </Right>
          </Header>
          <Container>
            <WebView
              startInLoadingState
              renderLoading={() => (
                <Spinner color="#D95640" style={{ marginTop: 100 }} />
              )}
              userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 10_0_1 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Mobile/14A403 Safari/602.1"
              source={{ uri }}
            />
          </Container>
        </Content>
      </Modal>
    );
  }

  render() {
    return (
      <Container style={{ flex: 1, backgroundColor: '#f4f4f4' }}>
        {this.modal()}
        <Header style={{ backgroundColor: '#f4f4f4', borderBottomWidth: 0 }}>
          <Left />
          <Body />
          <Right>
            <Button
              transparent
              onPress={() => this.props.navigation.navigate('Dev')}
            >
              <Icon style={{ color: '#333', opacity: 0.7 }} name="settings" />
            </Button>
          </Right>
        </Header>
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Image
            style={{
              alignSelf: 'center',
              justifyContent: 'center'
            }}
            source={logo}
          />
        </View>
        <View
          style={{
            marginBottom: 50,
            justifyContent: 'center',
            paddingLeft: 24,
            paddingRight: 24
          }}
        >
          <Button
            full
            style={{
              height: 60,
              backgroundColor: '#D95640',
              borderRadius: 6
            }}
            onPress={this._signInAsync}
          >
            <Text style={{ color: '#fff' }}>Sign In</Text>
          </Button>
        </View>
      </Container>
    );
  }
}

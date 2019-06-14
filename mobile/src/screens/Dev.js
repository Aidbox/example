import React from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {
  Button,
  Container,
  Content,
  Text,
  Form,
  Item,
  Input,
  Label
} from 'native-base';

import { getURL, getClientId, getRedirectUri } from '../lib/http';

export default class SignInScreen extends React.Component {
  static navigationOptions = {
    title: 'Dev'
  };

  state = {
    url: null,
    clientId: null,
    redirectUri: null
  };

  componentDidMount() {
    this._loadSettings();
  }

  _loadSettings = async () => {
    const url = await getURL();
    const redirectUri = await getRedirectUri();
    const clientId = await getClientId();
    this.setState({
      url,
      redirectUri,
      clientId
    });
  };

  _saveSettings = async () => {
    const {
      navigation: { goBack }
    } = this.props;
    const { url, redirectUri, clientId } = this.state;
    await AsyncStorage.setItem('baseUrl', url);
    await AsyncStorage.setItem('redirectUri', redirectUri);
    await AsyncStorage.setItem('clientId', clientId);
    goBack();
  };

  render() {
    const { url, redirectUri, clientId } = this.state;
    return (
      <Container>
        <Content>
          <Form>
            <Item floatingLabel>
              <Label>Server URL</Label>
              <Input
                value={url}
                onChangeText={v => this.setState({ url: v })}
              />
            </Item>
            <Item floatingLabel>
              <Label>Redirect uri</Label>
              <Input
                value={redirectUri}
                onChangeText={v => this.setState({ redirectUri: v })}
              />
            </Item>
            <Item floatingLabel>
              <Label>Client ID</Label>
              <Input
                value={clientId}
                onChangeText={v => this.setState({ clientId: v })}
              />
            </Item>
          </Form>
          <Button style={{ marginTop: 30 }} full onPress={this._saveSettings}>
            <Text>Save</Text>
          </Button>
        </Content>
      </Container>
    );
  }
}

import React from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import { Container, Content, Text, Spinner } from 'native-base';

import { getUserInfo, getUserId } from '../lib/helpers';
import { get } from '../lib/http';

export default class AuthLoadingScreen extends React.Component {
  constructor(props) {
    super(props);
    this._bootstrapAsync();
  }

  _bootstrapAsync = async () => {
    const userToken = await AsyncStorage.getItem('userToken');
    const {
      navigation: { navigate }
    } = this.props;
    try {
      const user = await getUserInfo(userToken);
      if (!user.data || !user.data.patient) {
        setTimeout(() => this._bootstrapAsync(), 2000);
      } else {
        navigate('App');
      }
    } catch (err) {
      console.log(err.response);
    }
  };

  render() {
    return (
      <Container>
        <Content>
          <Spinner color="#D95640" style={{ marginTop: 100 }} />
          <Text style={{ textAlign: 'center', fontSize: 18 }}>Creating patient...</Text>
        </Content>
      </Container>
    );
  }
}

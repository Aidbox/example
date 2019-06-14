import React from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import { Container, Content, Text, Spinner } from 'native-base';

import { getUserInfo } from '../lib/helpers';

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
    if (userToken) {
      try {
        const user = await getUserInfo(userToken);
        if (user.data && user.data.patient && user.data.patient.length > 0) {
          navigate('App');
        } else {
          navigate('PatientLoading');
        }
      } catch (err) {
        console.log(err, err.response);
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('patient');
        navigate('Auth');
      }
    } else {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('patient');
      navigate('Auth');
    }
  };

  render() {
    return (
      <Container>
        <Content>
          <Spinner color="#D95640" style={{ marginTop: 100 }} />
          <Text style={{ textAlign: 'center', fontSize: 18 }}>Loading...</Text>
        </Content>
      </Container>
    );
  }
}

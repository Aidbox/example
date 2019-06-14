import React from 'react';

import { RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import {
  Container,
  Content,
  Text,
  Button,
  Icon,
  Spinner,
  View
} from 'native-base';

import moment from 'moment';

import Header from '../components/Header';
import Title from '../components/Title';
import ViewBG from '../components/ViewBG';

import { capitalize, getPatientName, getUserInfo } from '../lib/helpers';

const ItemView = ({ label, children, style = {} }) => {
  const defaultStyle = {
    flexDirection: 'column',
    marginBottom: 16
  };
  return (
    <View style={{ ...defaultStyle, style }}>
      <Text note>{label}</Text>
      {children}
    </View>
  );
};

export default class ProfileScreen extends React.Component {
  static navigationOptions = {
    header: null
  };

  state = {
    refreshing: false,
    resource: null
  };

  async componentDidMount() {
    await this.getData();
  }

  async getData() {
    const userInfo = await AsyncStorage.multiGet(['patient', 'user']);
    const info = {};
    userInfo.forEach(([key, value]) => {
      info[key] = JSON.parse(value);
    });
    const { patient } = info;
    this.setState({
      resource: patient
    });
  }

  async updateData() {
    const userToken = await AsyncStorage.getItem('userToken');
    await getUserInfo(userToken);
    await this.getData();
  }

  telecomList({ telecom = [] }, type) {
    const list = telecom.filter(v => v.system === type);
    if (list.length === 0) {
      return null;
    }

    return list.map((v, i) => (
      <ItemView
        label={`${capitalize(type)} / ${v.use}`}
        key={`telecom-${type}-${i}`}
      >
        <Text>{v.value}</Text>
      </ItemView>
    ));
  }

  _logoutAsync = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('patient');
    await AsyncStorage.removeItem('patients');
    const {
      navigation: { navigate }
    } = this.props;
    navigate('Auth');
  };

  render() {
    const {
      navigation: { navigate }
    } = this.props;
    const { resource, refreshing } = this.state;
    return (
      <Container style={{ backgroundColor: '#fafafa' }}>
        <ViewBG />
        <Header
          right={
            <Button transparent onPress={() => navigate('ProfileEdit')}>
              <Icon
                style={{ color: '#fff', opacity: 0.9, fontSize: 20 }}
                name="edit"
                type="Entypo"
              />
            </Button>
          }
        />
        <Content
          style={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              tintColor="#fff"
              onRefresh={async () => {
                this.setState({ refreshing: true });
                await this.updateData();
                this.setState({ refreshing: false });
              }}
            />
          }
        >
          {!resource && <Title>Loading profile...</Title>}
          {resource && <Title>{getPatientName(resource)}</Title>}
          {!resource && <Spinner color="#fff" />}
          {resource && (
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 6,
                marginBottom: 8,
                padding: 16,
                shadowOffset: { width: 1, height: 1 },
                shadowColor: '#cccccc',
                shadowOpacity: 0.4
              }}
            >
              <ItemView label="Birthday">
                <Text>
                  {resource.birthDate
                    ? moment(resource.birthDate).format('MM/DD/YYYY')
                    : 'not set'}
                </Text>
              </ItemView>
              <ItemView label="Gender">
                <Text>{resource.gender ? resource.gender : 'not set'}</Text>
              </ItemView>
              {this.telecomList(resource, 'email')}
              {this.telecomList(resource, 'phone')}
              {this.telecomList(resource, 'fax')}
            </View>
          )}
          <Button
            full
            transparent
            style={{
              height: 60,
              borderColor: '#7C003E',
              borderWidth: 1,
              borderRadius: 6,
              marginTop: 16
            }}
            onPress={this._logoutAsync}
          >
            <Text style={{ color: '#7C003E' }}>Logout</Text>
          </Button>
        </Content>
      </Container>
    );
  }
}

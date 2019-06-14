import React from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';

import {
  Container,
  Content,
  Text,
  Button,
  Spinner,
  Item,
  Picker,
  Icon,
  Label,
  DatePicker,
  Input,
  Toast
} from 'native-base';

import Header from '../components/Header';
import Title from '../components/Title';
import ViewBG from '../components/ViewBG';
import ItemCard from '../components/ItemCard';

import { post } from '../lib/http';

import { getPatientName } from '../lib/helpers';

export default class ProfileScreen extends React.Component {
  static navigationOptions = {
    header: null
  };

  state = {
    loading: false,
    resource: null
  };

  async componentDidMount() {
    const patient = await AsyncStorage.getItem('patient');
    this.setState({
      resource: JSON.parse(patient)
    });
  }

  _changeGender = v => {
    const { resource } = this.state;
    this.setState({
      resource: { ...resource, gender: v }
    });
  };

  _changeBirthday = v => {
    const { resource } = this.state;
    this.setState({
      resource: { ...resource, birthDate: moment(v).format('YYYY-MM-DD') }
    });
  };

  _addNewTelecom = system => {
    const { resource } = this.state;
    const { telecom = [] } = resource;
    telecom.push({
      system,
      use: 'home',
      value: '',
      rank: 1
    });
    const nr = { ...resource, telecom };
    this.setState({
      resource: nr
    });
  };

  _changeTelecomUse = (type, idx, val) => {
    const { resource } = this.state;
    const { telecom } = resource;
    const list = telecom.filter(v => v.system === type);
    list[idx].use = val;
    const lst = telecom.filter(v => v.system !== type);
    const nr = { ...resource, telecom: [].concat(lst, list) };
    this.setState({
      resource: nr
    });
  };

  _changeTelecomValue = (type, idx, val) => {
    const { resource } = this.state;
    const { telecom } = resource;
    const list = telecom.filter(v => v.system === type);
    list[idx].value = val;
    const lst = telecom.filter(v => v.system !== type);
    const nr = { ...resource, telecom: [].concat(lst, list) };
    this.setState({
      resource: nr
    });
  };

  _removeTelecom = (type, idx) => {
    const { resource } = this.state;
    const { telecom } = resource;
    const list = telecom.filter(v => v.system === type);
    list.splice(idx, 1);
    const lst = telecom.filter(v => v.system !== type);
    const nr = { ...resource, telecom: [].concat(lst, list) };
    console.log(type, idx, list, nr);
    this.setState({
      resource: nr
    });
  };

  _handleUpdate = async () => {
    const { resource } = this.state;
    this.setState({ loading: true });
    try {
      const pt = await AsyncStorage.getItem('patient');
      const pts  = JSON.parse(pt);
      await AsyncStorage.setItem('patient', JSON.stringify(resource));
      await post({
        method: 'PUT',
        url: `/Patient/${pts.id}`,
        data: resource
      });
    } catch (err) {
      console.log(err.response || err);
      Toast.show({
        text: err.message,
        buttonText: 'OK'
      });
    }
    this.setState({ loading: false });
  };

  editTelecom({ telecom = [] }, type) {
    const list = telecom.filter(v => v.system === type);
    if (!list || list.length === 0) {
      return null;
    }
    return list.map((v, i) => (
      <Item fixedLabel key={`telecom-${type}-${i}`}>
        <Button transparent onPress={() => this._removeTelecom(type, i)}>
          <Icon
            style={{
              marginTop: 4,
              marginLeft: 0,
              marginRight: 0,
              color: '#7C003E'
            }}
            name="close"
            type="EvilIcons"
          />
        </Button>
        <Picker
          mode="dropdown"
          iosIcon={<Icon name="arrow-down" />}
          style={{ width: undefined, marginLeft: 0 }}
          placeholder="Gender"
          placeholderStyle={{ color: '#bfc6ea' }}
          placeholderIconColor="#007aff"
          selectedValue={v.use}
          onValueChange={val => this._changeTelecomUse(type, i, val)}
        >
          <Picker.Item label="Home" value="home" />
          <Picker.Item label="Work" value="work" />
          <Picker.Item label="Old" value="old" />
        </Picker>
        {type === 'email' && (
          <Input
            defaultValue={v.value}
            onChangeText={val => this._changeTelecomValue(type, i, val)}
            keyboardType="email-address"
            textContentType="emailAddress"
          />
        )}
        {['phone', 'fax'].includes(type) && (
          <Input
            defaultValue={v.value}
            onChangeText={val => this._changeTelecomValue(type, i, val)}
            keyboardType="number-pad"
            textContentType="telephoneNumber"
          />
        )}
      </Item>
    ));
  }

  render() {
    const {
      navigation: { goBack }
    } = this.props;
    const { resource, loading } = this.state;
    return (
      <Container style={{ backgroundColor: '#fafafa' }}>
        <ViewBG />
        <Header
          left={
            <Button
              style={{ marginLeft: 8 }}
              transparent
              onPress={() => goBack()}
            >
              <Icon
                style={{ color: '#fff', opacity: 0.9 }}
                name="ios-arrow-round-back"
              />
            </Button>
          }
        />
        <Content style={{ padding: 16 }}>
          {!resource && <Title>Edit profile</Title>}
          {resource && <Title>{getPatientName(resource)}</Title>}
          {loading || !resource ? <Spinner color="#fff" /> : null}
          {resource && (
            <ItemCard>
              <Item fixedLabel>
                <Label style={{ fontWeight: 'bold' }}>Birthday</Label>
                <DatePicker
                  maximumDate={new Date()}
                  timeZoneOffsetInMinutes={undefined}
                  placeHolderText="Select date"
                  onDateChange={this._changeBirthday}
                />
              </Item>
              <Item fixedLabel>
                <Label style={{ fontWeight: 'bold' }}>Gender</Label>
                <Picker
                  mode="dropdown"
                  iosIcon={<Icon name="arrow-down" />}
                  style={{ width: undefined }}
                  placeholder="Gender"
                  placeholderStyle={{ color: '#bfc6ea' }}
                  placeholderIconColor="#007aff"
                  selectedValue={resource.gender}
                  onValueChange={this._changeGender}
                >
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Other" value="other" />
                  <Picker.Item label="Unknown" value="unknown" />
                </Picker>
              </Item>
              <Item fixedLabel>
                <Label style={{ fontWeight: 'bold' }}>Email</Label>
                <Button
                  transparent
                  onPress={() => this._addNewTelecom('email')}
                >
                  <Icon name="plus" type="EvilIcons" />
                </Button>
              </Item>
              {this.editTelecom(resource, 'email')}
              <Item fixedLabel>
                <Label style={{ fontWeight: 'bold' }}>Phone</Label>
                <Button
                  transparent
                  onPress={() => this._addNewTelecom('phone')}
                >
                  <Icon name="plus" type="EvilIcons" />
                </Button>
              </Item>
              {this.editTelecom(resource, 'phone')}
              <Item fixedLabel last>
                <Label style={{ fontWeight: 'bold' }}>Fax</Label>
                <Button transparent onPress={() => this._addNewTelecom('fax')}>
                  <Icon name="plus" type="EvilIcons" />
                </Button>
              </Item>
              {this.editTelecom(resource, 'fax')}
              <Button
                transparent
                disabled={loading}
                onPress={this._handleUpdate}
                full
                style={{
                  height: 60,
                  borderColor: '#7C003E',
                  borderWidth: 1,
                  borderRadius: 6,
                  marginTop: 30
                }}
              >
                <Text style={{ color: '#7C003E' }}>Save</Text>
              </Button>
            </ItemCard>
          )}
        </Content>
      </Container>
    );
  }
}

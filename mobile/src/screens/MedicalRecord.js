import React from 'react';

import { RefreshControl, Image } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import {
  Container,
  Content,
  Text,
  View,
  Spinner,
  Icon,
  Button
} from 'native-base';

import Header from '../components/Header';
import Title from '../components/Title';
import ViewBG from '../components/ViewBG';

import alIcon from '../../static/icons/al.png';
import dxIcon from '../../static/icons/dx.png';
import immIcon from '../../static/icons/imm.png';
import medsIcon from '../../static/icons/meds.png';
import vsIcon from '../../static/icons/vs.png';

import ItemCard, { ItemCardLine, ItemCardTitle } from '../components/ItemCard';

import { formatDate } from '../lib/helpers';

import { get } from '../lib/http';

import {
  DiagnosesItem,
  AllergiesItem,
  MedicationsItem,
  ImmunizationsItem,
  VitItem
} from '../components/MedicalRecordItems';

import syncProcess from '../lib/sync';

export default class ProfileScreen extends React.Component {
  static navigationOptions = {
    header: null
  };

  ref = null;

  state = {
    syncWork: false,
    diagnoses: null,
    allergies: null,
    medications: null,
    immunizations: null,
    heart: null,
    weight: null,
    height: null,
    ihu: null,
    refreshing: false,
    first: true
  };

  async componentDidMount() {
    const pt = await AsyncStorage.getItem('patient');
    const { id } = JSON.parse(pt);
    this.ref = `Patient/${id}`;
    await this._getData();
  }

  _queryGet = async rt => {
    const resp = await get({
      url: `/${rt}`,
      params: { patient: this.ref },
      _sort:
        rt === 'Immunizations' ? '-.occurrence.dateTime' : '-.onset.dateTime'
    });
    if (resp && resp.data && resp.data.entry.length > 0) {
      const resources = resp.data.entry.map(({ resource }) => ({
        ...resource
      }));
      return resources;
    }
    return [];
  };

  _getObsByCode = async code => {
    const resp = await get({
      url: `/Observation`,
      params: {
        subject: this.ref,
        code,
        _count: 1,
        _sort: '-.effective.dateTime'
      }
    });
    if (resp && resp.data && resp.data.entry.length > 0) {
      return resp.data.entry[0].resource;
    }
    return null;
  };

  _getData = async () => {
    const diagnoses = await this._queryGet('Condition');
    const allergies = await this._queryGet('AllergyIntolerance');
    const medications = await this._queryGet('MedicationStatement');
    const immunizations = await this._queryGet('Immunization');
    const heart = await this._getObsByCode('8867-4');
    const weight = await this._getObsByCode('33141-3');
    const height = await this._getObsByCode('8302-2');
    const ihu = await this._getObsByCode('420317006');
    this.setState({
      first: false,
      diagnoses,
      allergies,
      medications,
      immunizations,
      heart,
      weight,
      height,
      ihu
    });
  };

  _sync = async () => {
    const { syncWork } = this.state;
    if (syncWork) {
      return;
    }
    this.setState({ syncWork: true });
    await syncProcess();
    await this._getData();
    this.setState({ syncWork: false });
  };

  render() {
    const {
      medications,
      diagnoses,
      allergies,
      immunizations,
      heart,
      weight,
      height,
      ihu,
      refreshing,
      first
    } = this.state;
    const {
      navigation: { navigate }
    } = this.props;
    return (
      <Container style={{ backgroundColor: '#fafafa' }}>
        <ViewBG />
        <Header
          right={
            <Button transparent onPress={() => this._sync()}>
              <Icon
                style={{ color: '#fff', opacity: 0.9 }}
                type="MaterialCommunityIcons"
                name="sync"
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
                await this._getData();
                this.setState({ refreshing: false });
              }}
            />
          }
        >
          <Title>Medical Chart</Title>
          {first && <Spinner color="#fff" />}
          <ItemCard>
            <ItemCardTitle onPress={() => navigate('Diagnoses')}>
              <Image
                source={dxIcon}
                style={{ width: 20, height: 20, marginRight: 8 }}
                resizeMod="center"
                resizeMethod="resize"
              />
              <Text style={{ fontWeight: 'bold' }}>Diagnoses</Text>
            </ItemCardTitle>
            <ItemCardLine />
            {(!diagnoses || diagnoses.length === 0) && (
              <Text>No known diagnoses</Text>
            )}
            {diagnoses &&
              diagnoses.length > 0 &&
              diagnoses.map((v, i) => (
                <View key={v.id}>
                  <DiagnosesItem resource={v} />
                  {diagnoses.length > i + 1 && <ItemCardLine />}
                </View>
              ))}
          </ItemCard>
          <ItemCard>
            <ItemCardTitle onPress={() => navigate('Allergies')}>
              <Image
                source={alIcon}
                style={{ width: 20, height: 20, marginRight: 8 }}
                resizeMod="center"
                resizeMethod="resize"
              />
              <Text style={{ fontWeight: 'bold' }}>Allergies</Text>
            </ItemCardTitle>
            <ItemCardLine />
            {(!allergies || allergies.length === 0) && (
              <Text>No known allergies</Text>
            )}
            {allergies &&
              allergies.length > 0 &&
              allergies.map((v, i) => (
                <View key={v.id}>
                  <AllergiesItem resource={v} />
                  {allergies.length > i + 1 && <ItemCardLine />}
                </View>
              ))}
          </ItemCard>
          <ItemCard>
            <ItemCardTitle onPress={() => navigate('Medications')}>
              <Image
                source={medsIcon}
                style={{ width: 20, height: 20, marginRight: 8 }}
                resizeMod="center"
                resizeMethod="resize"
              />
              <Text style={{ fontWeight: 'bold' }}>Medications</Text>
            </ItemCardTitle>
            <ItemCardLine />
            {(!medications || medications.length === 0) && (
              <Text>No known medications</Text>
            )}
            {medications &&
              medications.length > 0 &&
              medications.map((v, i) => (
                <View key={v.id}>
                  <MedicationsItem resource={v} />
                  {medications.length > i + 1 && <ItemCardLine />}
                </View>
              ))}
          </ItemCard>
          <ItemCard>
            <ItemCardTitle>
              <Image
                source={vsIcon}
                style={{ width: 20, height: 20, marginRight: 8 }}
                resizeMod="center"
                resizeMethod="resize"
              />
              <Text style={{ fontWeight: 'bold' }}>Vital Signs</Text>
            </ItemCardTitle>
            <ItemCardLine />
            <VitItem
              onPress={() => navigate('Vitals', { type: 'Weight' })}
              title="Weight"
              date={!weight ? null : formatDate(weight.effective.dateTime)}
              value={
                !weight ? null : (
                  <Text>
                    {parseInt(weight.value.Quantity.value, 10).toString()}{' '}
                    <Text note>kg</Text>
                  </Text>
                )
              }
            />
            <ItemCardLine />
            <VitItem
              title="Height"
              onPress={() => navigate('Vitals', { type: 'Height' })}
              date={!height ? null : formatDate(height.effective.dateTime)}
              value={
                !height ? null : (
                  <Text>
                    {parseInt(height.value.Quantity.value, 10).toString()}{' '}
                    <Text note>cm</Text>
                  </Text>
                )
              }
            />
            <ItemCardLine />
            <VitItem
              title="Heart Rate"
              onPress={() => navigate('Vitals', { type: 'HeartRate' })}
              date={!heart ? null : formatDate(heart.effective.dateTime)}
              value={
                !heart ? null : (
                  <Text>
                    {parseInt(heart.value.Quantity.value, 10).toString()}{' '}
                    <Text note>bpm</Text>
                  </Text>
                )
              }
            />
            <ItemCardLine />
            <VitItem
              title="Inhaler Usage"
              onPress={() => navigate('Vitals', { type: 'InhalerUsage' })}
              date={!ihu ? null : formatDate(ihu.effective.dateTime)}
              value={
                !ihu ? null : (
                  <Text>
                    {ihu.value.Quantity.value} <Text note>count</Text>
                  </Text>
                )
              }
            />
          </ItemCard>
          <ItemCard style={{ marginBottom: 60 }}>
            <ItemCardTitle onPress={() => navigate('Immunizations')}>
              <Image
                source={immIcon}
                style={{ width: 20, height: 20, marginRight: 8 }}
                resizeMod="center"
                resizeMethod="resize"
              />
              <Text style={{ fontWeight: 'bold' }}>Immunizations</Text>
            </ItemCardTitle>
            <ItemCardLine />
            {(!immunizations || immunizations.length === 0) && (
              <Text>No immunizations</Text>
            )}
            {immunizations &&
              immunizations.length > 0 &&
              immunizations.map((v, i) => (
                <View key={v.id}>
                  <ImmunizationsItem resource={v} />
                  {immunizations.length > i + 1 && <ItemCardLine />}
                </View>
              ))}
          </ItemCard>
        </Content>
      </Container>
    );
  }
}

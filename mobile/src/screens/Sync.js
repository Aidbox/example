import React from 'react';

import AsyncStorage from '@react-native-community/async-storage';

import { Text, Button, Container, Content, Toast, View } from 'native-base';

import { JSONPath } from 'jsonpath-plus';
import base64 from 'react-native-base64';

import { queryRecords, requestAuthorization } from '../lib/healthkit';

import {
  HeartRate2Fhir,
  Weight2Fhir,
  Height2Fhir,
  InhalerUsage2Fhir
} from '../lib/mapper';

import { post, get } from '../lib/http';

const sMap = {
  HeartRate: {
    rt: 'Observation',
    params: { code: '8867-4' }
  },
  Height: {
    rt: 'Observation',
    params: { code: '8302-2' }
  },
  Weight: {
    rt: 'Observation',
    params: { code: '33141-3' }
  },
  InhalerUsage: {
    rt: 'Observation',
    params: { code: '420317006' }
  }
};

export default class SyncScreen extends React.Component {
  state = {
    state: null,
    loading: false
  };

  componentDidMount() {
    this._initData();
  }

  _initData = async () => {
    const pt = await AsyncStorage.getItem('patient');
    const { id } = JSON.parse(pt);
    this.ref = `Patient/${id}`;
  };

  _getRecordsFor = async (rt, params) => {
    const resp = await get({
      url: `/${rt}`,
      params: {
        subject: this.ref,
        ...params
      }
    });
    if (resp && resp.data && resp.data.entry.length > 0) {
      return resp.data.entry.map(v => ({ ...v.resource }));
    }
    return null;
  };

  _syncData2Server = async (key, mapper) => {
    if (!(key in sMap)) {
      return [];
    }
    let records = await queryRecords(key, 200);
    records = records.map(v => ({
      ...v,
      id: base64.encode(`${v.startDate}:${v.value}:${v.unit}`)
    }));
    const { rt, params } = sMap[key];
    const old = await this._getRecordsFor(rt, params);
    if (old && old.length) {
      const ids = JSONPath({
        path:
          '$[*].identifier[?(@.system == "http://azglobal.aidbox.app/fhir/mobile-id")].value',
        json: old
      });
      records = records.filter(v => !ids.includes(v.id));
    }
    if (records.length === 0) {
      return [];
    }
    if (!this.patientId) {
      const pt = await AsyncStorage.getItem('patient');
      const { id } = JSON.parse(pt);
      this.patientId = id;
    }
    const mappedHR = mapper(records, this.patientId);
    return mappedHR.map(resource => ({
      resource,
      request: {
        method: 'POST',
        url: `/${rt}`
      }
    }));
  };

  _startSync = async () => {
    const s = await requestAuthorization();
    if (!s) {
      this.setState({
        state: 'Error connecting to HealthKit please check acceess.'
      });
      return;
    }
    this.setState({ state: 'Prepare Heart Rate' });
    const hr = await this._syncData2Server('HeartRate', HeartRate2Fhir);
    this.setState({ state: 'Prepare Weight' });
    const wh = await this._syncData2Server('Weight', Weight2Fhir);
    this.setState({ state: 'Prepare Height' });
    const hh = await this._syncData2Server('Height', Height2Fhir);
    this.setState({ state: 'Prepare Inhaler Usage' });
    const ih = await this._syncData2Server('InhalerUsage', InhalerUsage2Fhir);
    this.setState({ state: 'Uploading data to server' });
    const entry = [].concat(hr, wh, hh, ih);
    if (entry.length === 0) {
      this.setState({ state: 'Sync end. Nothing to update.', loading: false });
      return;
    }
    const bundle = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry
    };
    try {
      this.setState({ state: 'Updating to server' });
      await post({ url: `/fhir`, data: bundle });
      this.setState({
        state: `Sync end. Updated ${entry.length} resources`,
        loading: false
      });
    } catch (err) {
      console.log(err.response || err);
      Toast.show({
        text: err.message,
        buttonText: 'OK'
      });
      this.setState({
        state: `Error sync data to server`,
        loading: false
      });
    }
  };

  render() {
    const { state, loading } = this.state;
    return (
      <Container>
        <Content padder>
          <View style={{ marginTop: 50 }}>
            {state ? (
              <Text
                style={{
                  textAlign: 'center'
                }}
              >
                {state}
              </Text>
            ) : (
              <Text style={{ textAlign: 'center' }}>Ready to sync</Text>
            )}
            {!loading && (
              <Button full style={{ marginTop: 20 }} onPress={this._startSync}>
                <Text>Sync</Text>
              </Button>
            )}
          </View>
        </Content>
      </Container>
    );
  }
}

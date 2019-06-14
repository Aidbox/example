import AsyncStorage from '@react-native-community/async-storage';

import { Toast } from 'native-base';
import { JSONPath } from 'jsonpath-plus';
import base64 from 'react-native-base64';

import { queryRecords, requestAuthorization } from './healthkit';

import {
  HeartRate2Fhir,
  Weight2Fhir,
  Height2Fhir,
  InhalerUsage2Fhir
} from './mapper';

import { post, get } from './http';

const sMap = {
  HeartRate: {
    rt: 'Observation',
    params: { code: '8867-4', _sort: '-.effective.dateTime', _count: 1000 }
  },
  Height: {
    rt: 'Observation',
    params: { code: '8302-2', _sort: '-.effective.dateTime', _count: 1000 }
  },
  Weight: {
    rt: 'Observation',
    params: { code: '33141-3', _sort: '-.effective.dateTime', _count: 1000 }
  },
  InhalerUsage: {
    rt: 'Observation',
    params: { code: '420317006', _sort: '-.effective.dateTime', _count: 1000 }
  }
};

let ref = null;
let patientId = null;

const getRecordsFor = async (rt, params) => {
  const resp = await get({
    url: `/${rt}`,
    params: {
      subject: ref,
      ...params
    }
  });
  if (resp && resp.data && resp.data.entry.length > 0) {
    return resp.data.entry.map(v => ({ ...v.resource }));
  }
  return null;
};

const syncData2Server = async (key, mapper) => {
  if (!(key in sMap)) {
    return [];
  }
  let records = await queryRecords(key, 200);
  records = records.map(v => ({
    ...v,
    id: base64.encode(`${v.startDate}:${v.value}:${v.unit}`)
  }));
  const { rt, params } = sMap[key];
  const old = await getRecordsFor(rt, params);
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
  if (!patientId) {
    const pt = await AsyncStorage.getItem('patient');
    const { id } = JSON.parse(pt);
    patientId = id;
  }
  const mappedHR = mapper(records, patientId);
  return mappedHR.map(resource => ({
    resource,
    request: {
      method: 'POST',
      url: `/${rt}`
    }
  }));
};

export default async () => {
  const pt = await AsyncStorage.getItem('patient');
  const pts = JSON.parse(pt);
  patientId = pts.id;
  ref = `Patient/${patientId}`;

  const s = await requestAuthorization();
  if (!s) {
    Toast.show({
      text: 'Error connecting to HealthKit please check acceess.'
    });
    return;
  }
  Toast.show({ text: 'Sync started' });
  const hr = await syncData2Server('HeartRate', HeartRate2Fhir);
  const wh = await syncData2Server('Weight', Weight2Fhir);
  const hh = await syncData2Server('Height', Height2Fhir);
  const ih = await syncData2Server('InhalerUsage', InhalerUsage2Fhir);
  const entry = [].concat(hr, wh, hh, ih);
  if (entry.length === 0) {
    Toast.show({ text: 'Sync ended. Nothing to update.' });
    return;
  }
  const bundle = {
    resourceType: 'Bundle',
    type: 'transaction',
    entry
  };
  try {
    await post({ url: `/fhir`, data: bundle });
    Toast.show({ text: `Sync ended. Updated ${entry.length} resources` });
  } catch (err) {
    console.log(err.response);
    console.log(err.response || err);
    Toast.show({
      text: err.message,
      buttonText: 'OK'
    });
  }
};

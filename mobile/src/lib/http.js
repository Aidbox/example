import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';

export async function getURL() {
  const baseUrl = await AsyncStorage.getItem('baseUrl');
  if (!baseUrl) {
    return 'https://fullstack.aidbox.app';
  }
  return baseUrl;
}

export async function getClientId() {
  const clientId = await AsyncStorage.getItem('clientId');
  if (!clientId) {
    return 'mobile';
  }
  return clientId;
}

export async function getRedirectUri() {
  const redirectUri = await AsyncStorage.getItem('redirectUri');
  if (!redirectUri) {
    return 'aidbox://auth';
  }
  return redirectUri;
}

const reqParams = {
  responseType: 'json',
  headers: {
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    Expires: '0'
  }
};

export async function get({ headers = {}, url, params }) {
  const userToken = await AsyncStorage.getItem('userToken');
  const baseUrl = await getURL();
  const req = {
    ...reqParams,
    method: 'GET',
    url: url.startsWith('http') ? url : `${baseUrl}${url}`,
    headers: { ...reqParams.headers, ...headers },
    params
  };
  if (userToken) {
    req.headers = {
      Authorization: `Bearer ${userToken}`,
      ...req.headers
    };
  }
  return axios(req);
}

export async function post({
  headers = {},
  method = 'POST',
  url,
  data,
  params = {}
}) {
  const userToken = await AsyncStorage.getItem('userToken');
  const baseUrl = await getURL();
  const req = {
    ...reqParams,
    method,
    url: url.startsWith('http') ? url : `${baseUrl}${url}`,
    headers: { ...reqParams.headers, ...headers },
    params,
    data
  };
  if (userToken) {
    req.headers = {
      Authorization: `Bearer ${userToken}`,
      ...req.headers
    };
  }
  return axios(req);
}

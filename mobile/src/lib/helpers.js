import jwt from 'jwt-decode';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';

import { get } from './http';

/* eslint-disable */
export function atob(input) {
  const str = input.replace(/=+$/, '');
  let output = '';

  if (str.length % 4 === 1) {
    throw new Error(
      "'atob' failed: The string to be decoded is not correctly encoded."
    );
  }
  for (
    let bc = 0, bs = 0, buffer, i = 0;
    (buffer = str.charAt(i++));
    ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
      ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
      : 0
  ) {
    buffer = chars.indexOf(buffer);
  }

  return output;
}
/* eslint-enable */

export async function getUserId() {
  const user = await AsyncStorage.getItem('user');
  if (!user || user.length === 0) {
    throw new Error('Not authorized');
  }
  try {
    const { id } = JSON.parse(user);
    return id;
  } catch (err) {
    console.log(err);
    throw new Error('Not authorized');
  }
}

export async function getUserInfo(token) {
  const { data: user } = await get({ url: `/auth/userinfo` });
  if (!user) {
    throw new Error('Not authorized');
  }
  await AsyncStorage.setItem('user', JSON.stringify(user));
  if (user.data && user.data.patient && user.data.patient.length > 0) {
    try {
      const { data: patient } = await get({
        url: `/${user.data.patient}`
      });
      await AsyncStorage.setItem('patient', JSON.stringify(patient));
    } catch (err) {
      console.log(err);
    }
  }
  return user;
}

export function getPatientName(resource) {
  if (resource && resource.name && resource.name.length > 0) {
    return `${resource.name[0].given[0]} ${resource.name[0].family}`;
  }
  return null;
}

export const capitalize = s => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export function generatePin() {
  let pin = '';
  for (let i = 0; i < 6; i += 1) {
    pin += Math.floor(Math.random() * (9 - 1) + 1).toString();
  }
  return pin;
}

export function date2js(d) {
  return moment(d, 'YYYY-MM-DD HH:mm:ss ZZ').toDate();
}

export function formatDate(date, format = 'full') {
  const d = moment(date, 'YYYY-MM-DD HH:mm:ss ZZ');
  if (format === 'date') {
    return d.format(`D MMMM YY`);
  }
  if (format === 'hours') {
    return d.format(`HH:mm`);
  }
  return d.format(`D MMM'YY HH:mm`);
}

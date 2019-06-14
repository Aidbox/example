import { NativeModules } from 'react-native';

const { RNAppleHealth } = NativeModules;

export const constants = {
  version: RNAppleHealth.appVersion,
  deviceId: RNAppleHealth.deviceId,
  isHealthDataAvailable: RNAppleHealth.isHealthDataAvailable,
  isClinicalDataAvailable: RNAppleHealth.isClinicalDataAvailable
};

export async function requestAuthorization() {
  return new Promise((resolve, reject) => {
    RNAppleHealth.requestAuthorization(err => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}

export async function queryRecords(type, limit = 0) {
  return new Promise((resolve, reject) => {
    RNAppleHealth.queryRecords(type, limit, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

export async function authorizationStatus() {
  return new Promise((resolve, reject) => {
    RNAppleHealth.authorizationStatus((err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

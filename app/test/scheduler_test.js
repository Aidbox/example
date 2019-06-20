const test = require('tape');
const spawn = require('child_process').spawn;
const axios = require('axios');

const AUTH_HEADER = 'Basic dGVzdC1hcHA6dGVzdC1zZWNyZXQ=';
const AIDBOX_URL = process.env.AIDBOX_URL || 'http://localhost:9988';

var server = null;

const pingAidbox = (n = 0) => {
  console.log(`Connecting to aidbox... ${AIDBOX_URL}`);
  return axios({
    method: 'GET',
    url: AIDBOX_URL + '/Patient',
    headers: {
      authorization: AUTH_HEADER,
      accept: 'application/json'
    }
  })
    .then(() => {
      return Promise.resolve();
    })
    .catch(err => {
      console.log('Error connecting: ', err.message);

      if (n > 10) {
        return Promise.reject('Cannot connect to Aidbox');
      } else {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(pingAidbox(n + 1));
          }, 5000);
        });
      }
    });
};

function timeout(ms) {
  return new Promise(r => setTimeout(() => r(), ms));
}

test('start server', async t => {
  try {
    await pingAidbox();
    server = spawn('node', ['index.js'], {
      env: {
        APP_INIT_URL: AIDBOX_URL,
        APP_CLIENT_ID: 'test-app',
        APP_CLIENT_SECRET: 'test-secret',
        APP_URL: process.env.APP_URL || 'http://host.docker.internal:6666',
        PORT: 6666,
        APP_SECRET: 'appsecret',
        PATH: process.env.PATH
      },
      cwd: __dirname + '/../'
    });

    server.on('close', () => {
      server = null;
    });

    server.stdout.on('data', d => {
      console.log(d.toString());
    });
    server.stderr.on('data', data => {
      console.log(`stderr: ${data.toString()}`);
    });
    await timeout(2000);
    await axios({
      method: 'POST',
      url: AIDBOX_URL + '/$psql',
      headers: {
        authorization: AUTH_HEADER,
        accept: 'application/json'
      },
      data: {
        query: `truncate patient;truncate appointment; truncate appointment_history;delete from "user" where id = 'test'`
      }
    });
    await axios({
      method: 'POST',
      url: AIDBOX_URL,
      headers: {
        authorization: AUTH_HEADER,
        accept: 'application/json'
      },
      data: {
        resourceType: 'Bundle',
        type: 'transaction',
        entry: [
          {
            resource: {
              resourceType: 'Client',
              id: 'test',
              grant_types: ['password'],
              secret: 'testsecret'
            },
            request: {
              method: 'PUT',
              url: '/Client/test'
            }
          },
          {
            resource: {
              resourceType: 'AccessPolicy',
              engine: 'allow',
              id: 'allow-all'
            },
            request: {
              method: 'PUT',
              url: '/AccessPolicy/allow-all'
            }
          }
        ]
      }
    });
    t.end();
  } catch (err) {
    t.fail(err);
  }
});

test('Check after sub create user', async t => {
  t.plan(3);
  t.timeoutAfter(10000);
  try {
    let resp = await axios({
      method: 'POST',
      url: `${AIDBOX_URL}/User`,
      headers: {
        authorization: AUTH_HEADER,
        accept: 'application/json'
      },
      data: {
        resourceType: 'User',
        id: 'test',
        name: {
          formatted: 'Test User'
        },
        userName: 'test',
        password: 'test'
      }
    });
    t.ok(resp.data.id === 'test');
    await timeout(1000);
    resp = await axios({
      method: 'GET',
      url: `${AIDBOX_URL}/User/test`,
      headers: {
        authorization: AUTH_HEADER,
        accept: 'application/json'
      }
    });
    t.ok(resp.data.data.patient.length > 0);
    const patientRef = resp.data.data.patient;
    resp = await axios({
      method: 'GET',
      url: `${AIDBOX_URL}/${patientRef}`,
      headers: {
        authorization: AUTH_HEADER,
        accept: 'application/json'
      }
    });
    t.ok(`Patient/${resp.data.id}` === patientRef);
  } catch (err) {
    console.log(err);
    t.fail((err.response && JSON.stringify(err.response.data)) || err.message);
  }
});

let token = null;
test('Get token', async t => {
  t.plan(3);
  t.timeoutAfter(10000);
  const resp = await axios({
    method: 'POST',
    url: `${AIDBOX_URL}/auth/token`,
    data: {
      client_id: 'test',
      grant_type: 'password',
      username: 'test',
      password: 'test'
    }
  });
  t.ok(resp.data.userinfo.id === 'test');
  t.ok(resp.data.access_token.length > 0);
  t.ok(resp.data.token_type.length > 0);
  token = `${resp.data.token_type} ${resp.data.access_token}`;
});

test('Argonaut scheduling test', async t => {
  t.plan(8);
  t.timeoutAfter(10000);
  try {
    let resp = await axios({
      method: 'PUT',
      url: AIDBOX_URL + '/fhir/PractitionerRole/therapist',
      headers: {
        authorization: AUTH_HEADER
      },
      data: {
        resourceType: 'PractitionerRole',
        id: 'therapist',
        availableTime: [
          {
            daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
            availableStartTime: '10:00:00',
            availableEndTime: '12:00:00'
          }
        ]
      }
    });
    t.ok(resp.data.resourceType === 'PractitionerRole');
    resp = await axios({
      method: 'GET',
      url: AIDBOX_URL + '/fhir/Appointment/$find',
      headers: {
        authorization: token,
        accept: 'application/json'
      },
      params: {
        start: '2019-08-01T10:00:00',
        end: '2019-08-15T10:00:00'
      }
    });
    t.ok(resp.data.resourceType === 'Bundle');
    t.ok(resp.data.entry.length !== 0);

    const statuses = [...new Set(resp.data.entry.map(e => e.resource.status))];
    t.deepEqual(statuses, ['proposed']);
    const appt = resp.data.entry[0].resource;
    resp = await axios({
      method: 'POST',
      url: AIDBOX_URL + '/fhir/Appointment/$hold',
      headers: {
        authorization: AUTH_HEADER
      },
      data: appt
    });
    t.ok(resp.data.status === 'booked');
    resp = await axios({
      method: 'GET',
      url: AIDBOX_URL + '/fhir/Appointment/$find',
      headers: {
        authorization: token,
        accept: 'application/json'
      },
      params: {
        start: '2019-08-01T10:00:00',
        end: '2019-08-15T10:00:00'
      }
    });
    t.ok(resp.data.resourceType === 'Bundle');
    t.ok(resp.data.entry.length !== 0);

    const sts = [...new Set(resp.data.entry.map(e => e.resource.status))];
    t.deepEqual(sts, ['booked', 'proposed']);
  } catch (err) {
    console.log(err);
    t.fail((err.response && JSON.stringify(err.response.data)) || err.message);
  }
});

test('teardown', t => {
  if (server) {
    server.kill('SIGINT');
    t.end();
  }
});

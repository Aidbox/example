const aidbox = require('aidbox');

const { findAppointments, holdAppointment } = require('./appointment');
const { userSub } = require('./user');

const prRoles = require('./practitionerRoles.json');

const APP_ID = 'example-app';

const ctx = {
  debug: process.env.APP_DEBUG || false,
  env: {
    init_url: process.env.APP_INIT_URL,
    init_client_id: process.env.APP_CLIENT_ID,
    init_client_secret: process.env.APP_CLIENT_SECRET,

    app_id: APP_ID,
    app_url: process.env.APP_URL,
    app_port: process.env.PORT || 3000,
    app_secret: process.env.APP_SECRET
  },
  manifest: {
    id: APP_ID,
    type: 'app',
    subscriptions: {
      User: {
        handler: userSub
      }
    },
    operations: {
      appointment_find: {
        method: 'GET',
        path: ['fhir', 'Appointment', '$find'],
        handler: findAppointments
      },
      appointment_hold: {
        method: 'POST',
        path: ['fhir', 'Appointment', '$hold'],
        handler: holdAppointment
      }
    }
  }
};

async function prepareClientPolicy(context) {
  console.log('prepare access policy && oAuth mobile client');
  await context.request({
      url: '/',
      method: 'post',
      body: {
        resourceType: 'Bundle',
        type: 'Transaction',
        entry: [
          {
            resource: {
              auth: {
                authorization_code: {
                  redirect_uri: 'aidbox://auth'
                }
              },
              secret: process.env.APP_SECRET,
              first_party: true,
              grant_types: ['authorization_code'],
              id: 'mobile',
              resourceType: 'Client'
            },
            request: {
              method: 'PUT',
              url: '/Client/mobile'
            }
          },
          {
            resource: {
              "link": [{
                "id": "mobile",
                "resourceType": "Client"
              }],
              "engine": "allow",
              "id": "allow-mobile",
              "resourceType": "AccessPolicy"
            },
            request: {
              method: 'PUT',
              url: '/AccessPolicy/allow-mobile'
            }
          },
          {
            resource: {
              auth: {
                authorization_code: {
                  redirect_uri: `${process.env.APP_URL}/auth`
                }
              },
              secret: process.env.APP_SECRET,
              first_party: true,
              grant_types: ['authorization_code'],
              id: 'ui',
              resourceType: 'Client'
            },
            request: {
              method: 'PUT',
              url: '/Client/ui'
            }
          },
          {
            resource: {
              "link": [{
                "id": "ui",
                "resourceType": "Client"
              }],
              "engine": "allow",
              "id": "allow-ui",
              "resourceType": "AccessPolicy"
            },
            request: {
              method: 'PUT',
              url: '/AccessPolicy/allow-mobile'
            }
          }
        ]
      }
    });
}

async function initPractitionerRoles(c) {
  console.log("Initializing practitioner roles");
  const res = await c.request({
    url: '/PractitionerRole',
    method: 'get'
  });
  if (res.total === 0) {
    await c.request({
      url: '/',
      method: 'post',
      body: {
        resourceType: 'Bundle',
        type: 'Transaction',
        entry: prRoles
      }
    });
  }
}

async function start() {
  console.log('try to register aidbox app', process.env.APP_INIT_URL);
  try {
    const c = await aidbox.start(ctx);
    console.log('aidbox app was registred');
    await prepareClientPolicy(c);
    await initPractitionerRoles(c);
    console.log('App was started');
  } catch (err) {
    aidbox.stop();
    console.log('Error:', err.body);
    setTimeout(() => {
      start();
    }, 5000);
  }
}

start();

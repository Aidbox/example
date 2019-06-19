const aidbox = require('aidbox');

const { findAppointments, holdAppointment } = require('./appointment');
const { userSub } = require('./user');

var APP_ID = 'scheduler';

var ctx = {
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

async function start() {
  console.log('try to register aidbox app');
  try {
    const c = await aidbox.start(ctx);
    console.log('aidbox app was registred');
    console.log('prepare access policy && oAuth mobile client');
    await c.request({
      url: '/',
      method: 'post',
      body: {
        resourceType: 'Bundle',
        type: 'transaction',
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
  } catch (err) {
    aidbox.stop();
    console.log('Error:', err.body);
    setTimeout(() => {
      start();
    }, 5000);
  }
}

start();

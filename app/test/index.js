const chai = require('chai');
const sinon = require('sinon');
const moment = require('moment');
const chaiAsPromised = require('chai-as-promised');
const rewire = require('rewire');
const aidbox = rewire('aidbox');

const expect = chai.expect;
chai.use(chaiAsPromised);

const abStart = () => {
  return Promise.resolve( {
    debug: false,
    env:
    { init_url: 'http://aidbox:8080',
      init_client_id: 'test-app',
      init_client_secret: 'test-secret',
      app_id: 'example-app',
      app_url: 'http://app:6666',
      app_port: '6666',
      app_secret: 'appsecret' },
    manifest:
    { id: 'example-app',
      type: 'app',
      subscriptions: { User: [Object] },
      operations: { appointment_find: [Object], appointment_hold: [Object] } },
    query: [Function],
    request: [Function],
    state:
    { meta: { versionId: '2', lastUpdated: '2019-06-21T11:59:54.147Z' },
      secret: 'f1beffd9-8a4c-4b43-8030-0017e1f3dba1',
      grant_types: [ 'basic' ],
      resourceType: 'Client',
      id: 'example-app' }
   });
};


/*{ debug: false,
  env: 
  { init_url: 'http://aidbox:8080',
    init_client_id: 'test-app',
    init_client_secret: 'test-secret',
    app_id: 'example-app',
    app_url: 'http://app:6666',
    app_port: '6666',
    app_secret: 'appsecret' },
  manifest: 
  { id: 'example-app',
    type: 'app',
    subscriptions: { User: [Object] },
    operations: { appointment_find: [Object], appointment_hold: [Object] } },
  query: [Function],
  request: [Function],
  state: 
  { meta: { versionId: '2', lastUpdated: '2019-06-21T11:59:54.147Z' },
    secret: 'f1beffd9-8a4c-4b43-8030-0017e1f3dba1',
    grant_types: [ 'basic' ],
    resourceType: 'Client',
    id: 'example-app' } }/*/

describe("index.js", () => {
  describe("#start()", () => {
    //it('get me throw', async () => {
      //expect(await start()).to.equal({});
    //});

  });

});

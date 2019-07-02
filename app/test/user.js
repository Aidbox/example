const chai = require('chai');
const sinon = require('sinon');
const chaiAsPromised = require('chai-as-promised');

const { userSub } = require('../user.js');

const expect = chai.expect;
chai.use(chaiAsPromised);

const msg = {
  type: 'subscription',
  box: { 'base-url': 'http://aidbox:8080' },
  handler: 'User_handler',
  event: {
    tx: { id: 590, ts: '2019-06-28T10:17:46.359Z', resource: {} },
    resource: {
      name: { formatted: 'Test User' },
      password: '$s0$f0801$pvHpHvPETEMp7uihFd6i4Q==$V59sJNFeaKVFxFTtQmokCD5ujcvAGIn6futA9HLjrSE=',
      userName: 'test',
      id: 'test',
      resourceType: 'User' },
    action: 'create'
  }
}

const ctx = {
  request: (data) => {
    if (data.url === '/fhir/Patient/$match') {
        return Promise.resolve({
          resourceType: 'Bundle', type: 'search', entry: [], total: 0
        });
    }
    else if (data.url === '/fhir/Patient') {
        return Promise.resolve({
          name: [ { given: [ 'Test' ], family: 'User' } ],
          telecom: [ { use: 'home', system: 'email' } ],
          id: '8a58edc1-c834-4528-a6fb-65e770656b09',
          meta: { lastUpdated: '2019-06-28T13:20:06.653Z', versionId: '709' },
          resourceType: 'Patient'
        });
    }
    else {
      return Promise.resolve({
        data: { patient: 'Patient/8a58edc1-c834-4528-a6fb-65e770656b09' },
        meta: { lastUpdated: '2019-06-28T13:53:36.814Z', versionId: '734' },
        name: { formatted: 'Test User', givenName: 'Test', familyName: 'User' },
        password: '$s0$f0801$nOWp5NX3x43ck03wc7vdHA==$xfcR7jVIHSPZesK9sHIrmOw7MVT7aBIhcAe5Ymu59iY=',
        userName: 'test',
        id: 'test',
        resourceType: 'User'
      });
    }
  }
};

const ctxNonEmpty = {
  request: () => {
    return Promise.resolve({
      resourceType: 'Bundle', type: 'search', entry: [{
        resource: {
          id: 'foundone',
        }
      }],
      total: 1
    });
  }
};

let spy;
let spyConsole;
let spyNonEmpty;

describe("user.js", () => {
  before(() => {
    spy = sinon.spy(ctx, 'request');
    spyConsole = sinon.spy(console, 'error');
    spyNonEmpty = sinon.spy(ctxNonEmpty, 'request');
  });
  after(() => {
    spy.restore();
    spyConsole.restore();
    spyNonEmpty.restore();
  });
  afterEach(() => {
    spy.resetHistory();
  });
  describe("#userSub()", () => {
    it('error of no subscription data', () => {
      expect(userSub({}, {}))
        .to.eventually.be.rejectedWith(Error, "Cannot destructure property `action` of 'undefined' or 'null'");
    });
    it('get me error log', async () => {
      let q = JSON.parse(JSON.stringify(msg));
      delete q.event.resource.name;
      const res = await userSub({}, q);
      expect(spyConsole.calledOnce).to.equal(true);
    });
    it('finished with patient created', async () => {
      await userSub(ctx, msg);
      expect(spy.calledThrice).to.equal(true);
    });
    it('finished with patient attached', async () => {
      await userSub(ctxNonEmpty, msg);
      expect(spyNonEmpty.calledTwice).to.equal(true);
    });
    it('action is update', async () => {
      msg.event.action = 'update';
      await userSub(ctx, msg);
      expect(spy.notCalled).to.equal(true);
    });
  });
});

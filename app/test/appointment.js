const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const moment = require('moment');

const expect = chai.expect;
chai.use(chaiAsPromised);

const { findAppointments, holdAppointment } = require('../appointment');

const qq = {
  request: {
    params: { start: null, end: null },
    headers: { authorization: null },
  }
};

const dateResult = [];
for (let i = 0; i < 5; i+=1) {
  let date = moment();
  if (i === 0) {
    date = date.subtract(1, 'd');
  } else if (i > 1){
    date.add(i, 'd');
  }
  dateResult.push({
    pr: 'therapist',
    day: date.format('dd').toLowerCase(),
    start: date.format('YYYY-MM-DD'),
    start_2: '10:00:00',
    app: [1, 3].includes(i) ? `app-${i}` : null
  });
}

const qgood = {
  type: 'operation',
  request:  {
    resource: {
      resourceType: 'Appointment',
      id: null,
      status: 'proposed',
    },
    params: { start: '2019-08-01T10:00:00', end: '2019-08-15T10:00:00' },
    'route-params': {},
    headers:
    { accept: 'application/json',
      authorization: 'Bearer NWNkYWZiMjUtY2E1Zi00ZjIwLTlkZWMtYmFlMzcxMTEzYjQ2',
      connection: 'close',
      host: 'aidbox:8080',
      'user-agent': 'axios/0.19.0' },
    'oauth/user':
    { id: 'test',
      data: { patient: 'Patient/eaac7242-bb5d-4b56-b7c7-4828ac42997a' },
      meta: {},
      name: { formatted: 'Test User', givenName: 'Test', familyName: 'User' },
      password: '$s0$f0801$KnbobTyapu/lfqTcRDqzBA==$dAt3WtfsFQhoI5m5wTNzm2kYfQFydL1iNC/+u0JLQYw=',
      userName: 'test',
      resourceType: 'User' },
    'oauth/client':
    { id: 'test',
      secret: 'testsecret',
      grant_types: [ 'password' ],
      resourceType: 'Client' }
  },
};

const ctx = {
  query: () => {
    return Promise.resolve(dateResult);
  },
  request: (data) => {
    return Promise.resolve({
      status: data.body.status,
    });
  }
};

describe("appointment.js", () => {
  describe('#findAppointments()', () => {
    it('error if not request', async () => {
      expect(await findAppointments(null, { }))
        .and.to.be.include({ error: 'not enough parameters'});
    });
    it('error if not request.params', async () => {
      expect(await findAppointments(null, { request: {} }))
        .and.to.be.include({ error: 'not enough parameters'});
    });
    it('error of user not set', async () => {
      const q = {...qq};
      expect(await findAppointments(null, q))
        .and.to.be.include({ error: 'cannot get current user'});
    });
    it('error of user.data not set', async () => {
      const q = {...qq};
      q['oauth/user'] = {};
      expect(await findAppointments(null, q))
        .and.to.be.include({ error: 'cannot get current user'});
    });
    it('error of user.data.patient not set', async () => {
      const q = {...qq};
      q['oauth/user'] = { data: {} };
      expect(await findAppointments(null, q))
        .and.to.be.include({ error: 'cannot get current user'});
    });
    it('get me throw', async () => {
      const q = { ...qq };
      delete q.request.headers;
      const res = await findAppointments(null, q);
      const th = () => {
        throw res.error;
      };
      expect(th).to.throw(TypeError, "Cannot destructure property `authorization` of 'undefined' or 'null'.");
    });
    it('good request', async () => {
      const q = { ...qgood };
      q.request.params = {
        start: moment().format('YYYY-MM-DD'),
        end: moment().add(2, 'd').format('YYYY-MM-DD'),
        'visit-type': 'breast-imaging',
      };
      const ret = await findAppointments(ctx, q);
      expect(ret).to.include({
        resourceType: 'Bundle',
        type: 'searchset',
        total: 3
      });
      expect(ret.entry.length).to.equal(3);
      ret.entry.map(entry => {
        if (entry.resource.serviceType)
          expect(entry.resource.serviceType[0].coding[0].code)
          .to.equal('breast-imaging');
      });
    });
  });
  describe('#holdAppointment()', () => {
    it('good request', async () => {
      const q = { ...qgood };
      expect(await holdAppointment(ctx, q)).to.include({status: 'booked'});
    });
    it('error of no resource', () => {
      const q = { ...qq };
      expect(holdAppointment(ctx, q)).to.eventually.be.rejectedWith(Error, "Cannot set property 'id' of undefined");
    });
  });
});



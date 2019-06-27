const moment = require('moment');

const visitTypes = require('./visit-types');

const APPT_DURATION = 30 * 60 * 1000;

function getAppointmentsStmt(start, end) {
  return `
WITH avail AS (
  SELECT
      id, jsonb_array_elements(resource->'availableTime') AS avail
  FROM practitionerrole
), intervals AS (
  SELECT
      id,
      jsonb_array_elements_text(avail->'daysOfWeek') AS day,
      (avail->>'availableStartTime')::time AS sstart,
      (avail->>'availableEndTime')::time AS send
  FROM avail
), days AS (
  SELECT
      t AS t,
      ('{mon,tue,wed,thu,fri,sat,sunmon}'::text[])[EXTRACT(ISODOW FROM t)] AS day
  FROM (
    SELECT generate_series(
	 '${start}',
	 '${end}',
	 interval '1 day'
  ) AS t) _
), slots AS (
  SELECT id, day, start, tstzrange(start, start + '30min'::interval) AS rg
  FROM (
    SELECT
       i.id, i.day,
       generate_series(d.t + i.sstart, d.t + i.send, '30min'::interval) AS start
    FROM intervals i, days d
    WHERE i.day =  d.day
  ) _
)
SELECT
    s.id AS pr,
    s.day,
    s.start::date::text,
    s.start::time::text,
    a.id AS app
FROM slots s
LEFT JOIN appointment a ON tstzrange((a.resource->>'start')::timestamp,(a.resource->>'end')::timestamp) && s.rg
ORDER BY s.rg
`;
}

function makeEntry(data, { patient, visitType }) {
  const prRole = data.pr;
  const day = data.day;
  const startDate = data.start;
  const startTime = data.start_2;

  const appId = data.app;

  const startDateTime = new Date(`${data.start}T${data.start_2}Z`);
  const endDateTime = new Date(startDateTime.getTime() + APPT_DURATION);

  if (appId != null) {
    return {
      resource: {
        resourceType: 'Appointment',
        id: appId,
        status: 'booked',
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString()
      }
    };
  } else {
    return {
      resource: {
        resourceType: 'Appointment',
        id: `proposed-${prRole}-${startDate}T${startTime}`,
        status: 'proposed',
        serviceType: [{ coding: [visitType] }],
        appointmentType: {
          coding: [{ system: 'http://hl7.org/fhir/v2/0276', code: 'ROUTINE' }]
        },
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        participant: [
          {
            actor: { reference: `PractitionerRole/${prRole}` },
            required: 'required',
            status: 'needs-action'
          },
          {
            actor: { reference: patient },
            required: 'required',
            status: 'needs-action'
          }
        ]
      }
    };
  }
}

async function findAppointments(ctx, msg) {
  if (!msg.request || !msg.request.params) {
    return {error: "not enough parameters"};
  };

  try {
    const {
      request: {
        params: { start, end, ...restParams },
        headers: { authorization },
        ...restReq
      }
    } = msg;

    const tt = 'visit-type' in restParams ? restParams['visit-type'] : 'consult';
    const visitType = visitTypes.find(v => v.code === tt);
    const user = restReq['oauth/user'];

    if (!user || !user.data || !user.data.patient) {
      return {error: "cannot get current user"};
    }

    const patient = user.data.patient;

    const rr = getAppointmentsStmt(start, end);
    const data = await ctx.query(rr);
    const rdata = data
	        .filter(d => moment(d.start).isAfter(start))
	        .map(d => makeEntry(d, { patient, visitType }));
    return {
      resourceType: 'Bundle',
      type: 'searchset',
      total: rdata.length,
      entry: rdata
    };
  } catch (error) {
    return { error };
  }
}

async function holdAppointment(ctx, msg) {
  msg.request.resource.id = null;
  msg.request.resource.status = 'booked';
  const data = await ctx.request({
    url: '/fhir/Appointment',
    method: 'POST',
    body: msg.request.resource
  });
  return data;
}

module.exports = {
  findAppointments,
  holdAppointment
};

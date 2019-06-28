async function userSub(ctx, msg) {
  const {
    event: { action, resource }
  } = msg;
  if (action === 'create') {
    try {
      if (
        !resource.name.familyName &&
        !resource.name.givenName &&
        resource.name.formatted
      ) {
        const [givenName, familyName] = resource.name.formatted.split(' ');
        resource.name.familyName = familyName;
        resource.name.givenName = givenName;
      }
      const patientRes = {
        resourceType: 'Patient',
        name: [
          {
            family: resource.name.familyName,
            given: [resource.name.givenName]
          }
        ],
        telecom: [{ value: resource.email, use: 'home', system: 'email' }]
      };
      const patients = await ctx.request({
        url: '/fhir/Patient/$match',
        method: 'post',
        body: {
          resourceType: 'Parameters',
          parameter: [
            {
              name: 'resource',
              resource: patientRes
            }
          ]
        }
      });
      let patient = null;
      if (patients.total > 0) {
        patient = `Patient/${patients.entry[0].resource.id}`;
      } else {
        const patientReq = await ctx.request({
          url: '/fhir/Patient',
          method: 'post',
          body: patientRes
        });
        patient = `Patient/${patientReq.id}`;
      }
      if (patient) {
        if (!resource.data) {
          resource.data = {};
        }
        resource.data.patient = patient;
        await ctx.request({
          url: `/fhir/User/${resource.id}`,
          method: 'put',
          body: resource
        });
      }
      else {
        console.log('Can never get here!');
      }
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = {
  userSub
};

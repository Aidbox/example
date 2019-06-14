export function Height2Fhir(list, patientId) {
  return list.map(({ id, value, startDate, unit }) => ({
    resourceType: 'Observation',
    identifier: [
      {
        system: 'http://azglobal.aidbox.app/fhir/mobile-id',
        value: id
      }
    ],
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/vitalsigns']
    },
    subject: {
      resourceType: 'Patient',
      id: patientId
    },
    text: {
      status: 'generated',
      div: `<div xmlns='http://www.w3.org/1999/xhtml'>Height Patient:Height (8302-2): ${value} ${unit}</div>`
    },
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://hl7.org/fhir/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs'
          }
        ],
        text: 'Vital Signs'
      }
    ],
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '8302-2',
          display: 'Body height'
        }
      ],
      text: 'Body height'
    },
    effectiveDateTime: startDate,
    valueQuantity: {
      value,
      unit,
      system: 'http://unitsofmeasure.org',
      code: `/${unit}`
    }
  }));
}

export function Weight2Fhir(list, patientId) {
  return list.map(({ id, value, startDate, unit }) => ({
    identifier: [
      {
        system: 'http://azglobal.aidbox.app/fhir/mobile-id',
        value: id
      }
    ],
    resourceType: 'Observation',
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/vitalsigns']
    },
    subject: {
      resourceType: 'Patient',
      id: patientId
    },
    text: {
      status: 'generated',
      div: `<div xmlns='http://www.w3.org/1999/xhtml'>Weight Patient:Weight (33141-3): ${value} ${unit}</div>`
    },
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://hl7.org/fhir/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs'
          }
        ],
        text: 'Vital Signs'
      }
    ],
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '33141-3',
          display: 'Body weight'
        }
      ],
      text: 'Body weight'
    },
    effectiveDateTime: startDate,
    valueQuantity: {
      value,
      unit,
      system: 'http://unitsofmeasure.org',
      code: `/${unit}`
    }
  }));
}

export function HeartRate2Fhir(list, patientId) {
  return list.map(({ id, value, startDate, unit }) => ({
    resourceType: 'Observation',
    identifier: [
      {
        system: 'http://azglobal.aidbox.app/fhir/mobile-id',
        value: id
      }
    ],
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/vitalsigns']
    },
    subject: {
      resourceType: 'Patient',
      id: patientId
    },
    text: {
      status: 'generated',
      div: `<div xmlns='http://www.w3.org/1999/xhtml'>Heart Rate Patient:Heart Rate (8867-4): ${value} ${unit}</div>`
    },
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://hl7.org/fhir/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs'
          }
        ],
        text: 'Vital Signs'
      }
    ],
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '8867-4',
          display: 'Heart rate'
        }
      ],
      text: 'Heart rate'
    },
    effectiveDateTime: startDate,
    valueQuantity: {
      value,
      unit,
      system: 'http://unitsofmeasure.org',
      code: '/min'
    }
  }));
}

export function InhalerUsage2Fhir(list, patientId) {
  return list.map(({ id, value, startDate, unit }) => ({
    resourceType: 'Observation',
    identifier: [
      {
        system: 'http://azglobal.aidbox.app/fhir/mobile-id',
        value: id
      }
    ],
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/vitalsigns']
    },
    subject: {
      resourceType: 'Patient',
      id: patientId
    },
    text: {
      status: 'generated',
      div: `<div xmlns='http://www.w3.org/1999/xhtml'>Inhaler Usage Patient:Inhaler Usage (420317006): ${value} ${unit}</div>`
    },
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://hl7.org/fhir/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs'
          }
        ],
        text: 'Vital Signs'
      }
    ],
    code: {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: '420317006',
          display: 'Inhaler Usage'
        }
      ],
      text: 'Inhaler Usage'
    },
    effectiveDateTime: startDate,
    valueQuantity: {
      value,
      unit,
      system: 'http://unitsofmeasure.org',
      code: '/count'
    }
  }));
}

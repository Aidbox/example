const types = [
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'breast-imaging',
    display: 'BREAST IMAGING'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'consult',
    display: 'CONSULTATION'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'ct',
    display: 'COMPUTED TOMOGRAPHY SCAN(CT)'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'dental',
    display: 'DENTAL'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'dxa',
    display: 'DUAL-ENERGY X-RAY ABSORPTIOMETRY(DXA)'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'echo',
    display: 'ECHOCARDIOGRAPHY(ECHO)'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'echo-stresstest',
    display: 'ECHOCARDIOGRAPHY(ECHO) STRESS TEST'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'ed-followup',
    display: 'EDUCATION FOLLOW UP'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'eeg',
    display: 'ELECTROENCEPHALOGRAPHY(EEG)'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'egd',
    display: 'ESOPHAGOGASTRODUODENOSCOPY(EGD)'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'ekg',
    display: 'ELECTROCARDIOGRAM(EKG)'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'evaluation',
    display: 'EVALUATION'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'flu-shot-clinic',
    display: 'INFLUENZA VACCINATION CLINIC'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'fluoroscopy',
    display: 'FLUOROSCOPY'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'follow-up',
    display: 'FOLLOW UP'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'home-health',
    display: 'HOME HEALTH VISIT'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'injection',
    display: 'INJECTION'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'inter-rad',
    display: 'INTERVENTIONAL RADIOLOGY'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'lab',
    display: 'LABORATORY TESTS'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'minor-surgery',
    display: 'MINOR SURGERY'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'mri',
    display: 'MAGNETIC RESONANCE IMAGING(MRI)'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'new-patient',
    display: 'NEW PATIENT'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'nuc-med',
    display: 'NUCLEAR MEDICINE'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'occup-therapy',
    display: 'OCCUPATIONAL THERAPY'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'office-visit',
    display: 'OFFICE VISIT'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'physical',
    display: 'PHYSICAL'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'post-op',
    display: 'POST-OPERATIVE(POST-OP)'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'pre-admit-testing',
    display: 'PRE-ADMISSION TESTING VISIT'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'pre-op',
    display: 'PRE-OPERATIVE(PRE-OP)'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'procedure',
    display: 'PROCEDURE'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'same-day',
    display: 'SAME DAY'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'stress-test',
    display: 'STRESS TEST'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'surgery',
    display: 'SURGERY'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'treatment',
    display: 'TREATMENT'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'ultrasound',
    display: 'ULTRASOUND'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'urgent',
    display: 'URGENT'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'vaccine',
    display: 'VACCINATION'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'vision',
    display: 'VISION'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'walk-in',
    display: 'WALK IN'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'well-child',
    display: 'WELL CHILD'
  },
  {
    system: 'http://fhir.org/guides/argonaut-scheduling/CodeSystem/visit-type',
    code: 'x-ray',
    display: 'X-RAY'
  }
];

module.exports = types;

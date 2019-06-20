# Aidbox example

## Project structure
- [app](#app) - aidbox app
- [mobile](#mobile) - react-native iOS app

## <a name="mobile">Mobile</a> - aidbox mobile example app


## <a name="app">App</a> - aidbox extend app
- After new user registred creating patient for this user
- Simple implementation FHIR [Argo-Scheduling](http://www.fhir.org/guides/argonaut/scheduling/)

## Deployment
- Create new box in https://aidbox.app
- Prepare aidbox
  - In aidbox console open section *Auth Clients*
  - Click to *New* button
  - Insert this code and click to *Save* button
```yaml
secret: my-super-secret
first_party: true
grant_types:
  - client_credentials
  - basic
id: fullstack-app
resourceType: Client

```  
- [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Aidbox/example/tree/master)
  - Insert all information
- Try to create new from console User and check new patient

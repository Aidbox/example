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
  - Open section *Access Control*
  - Click *New* button
  - Insert this code and click *Save* button
    ```yaml
    link:
      - id: fullstack-app
        resourceType: Client
    engine: allow
    id: fullstack-app
    resourceType: AccessPolicy
    
    ```

- [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Aidbox/example/tree/master)
  - Insert all information
- Go to *Users* console on Aidbox and create a new user as shown below:
```yaml
name:
  formatted: Test User
  givenName: Test
  familyName: User
email: test@test.com
password: test
id: test
resourceType: User

```
- Go to REST console and type in ```GET /Patient```, a new patient should be created
- Go back to *Users* console, select the created user and check if it's updated with a patient reference like:
```yaml
data:
  patient: Patient/<patient_id>
```

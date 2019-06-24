# Aidbox example

## Project structure
- [app](#app) - Aidbox app
- [mobile](#mobile) - React Native iOS app

## <a name="mobile">Mobile</a> - Aidbox mobile example app


## <a name="app">App</a> - Aidbox extend app
- Creates a patient upon registering a new user
- A simple implementation of FHIR [Argo-Scheduling](http://www.fhir.org/guides/argonaut/scheduling/)

## Deployment

- Create a new box in https://aidbox.app or set up an Aidbox.Dev on your localhost
- Prepare Aidbox
  - In Aidbox console open section **Auth Clients**
  - Click **New** button
  - Insert this code and click to **Save** button
    ```yaml
    secret: my-super-secret
    first_party: true
    grant_types:
      - client_credentials
      - basic
    id: fullstack-app
    resourceType: Client
    
    ``` 
  - Open section **Access Control**
  - Click **New** button
  - Insert this code and click **Save** button
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
- Go to **Users** console on Aidbox and create a new user as shown below:
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
- Go back to **Users** console, select the created user and check if it's updated with a patient reference like:
```yaml
data:
  patient: Patient/<patient_id>
```

### Run locally

- Clone the *App* directory to your local machine
```
git clone https://github.com/Aidbox/example/tree/master/app
```
- Create a *.env* file from *env-tpl*
```
cp env-tpl .env
```
- Set all variables in a similar fashion:
```yaml
export APP_INIT_URL=http://localhost:8888  //your Aidbox server URL
export APP_CLIENT_ID=fullstack-app              
export APP_CLIENT_SECRET=my-super-secret
export APP_URL=http://localhost:3000
export APP_SECRET=123456789
export PORT=3000

```
- You might need to run
```bash
source .env
```
additionally and/or give your full local IP instead of "localhost"
- Run this command to start the app
```bash
npm start
```

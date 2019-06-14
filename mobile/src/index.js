import React from 'react';
import {
  createSwitchNavigator,
  createStackNavigator,
  createBottomTabNavigator,
  createAppContainer
} from 'react-navigation';

import { Root, Icon } from 'native-base';

import AuthLoadingScreen from './screens/AuthLoading';
import SignInScreen from './screens/SignIn';
import PatientLoadingScreen from './screens/PatientLoading';
import DevScreen from './screens/Dev';
import ProfileScreen from './screens/Profile';
import ProfileEditScreen from './screens/ProfileEdit';
import UnderConstructionScreen from './screens/UnderConstruction';
import AppointmentIndexScreen from './screens/Appointment';
import MedicalRecordScreen from './screens/MedicalRecord';
import DiagnosesScreen from './screens/Condition';
import AllergiesScreen from './screens/Allergy';
import MedicationsScreen from './screens/Medication';
import ImmunizationsScreen from './screens/Immunization';
import VitalsScreen from './screens/Vitals';
import ViewResourceScreen from './screens/ViewResource';
import SyncDataScreen from './screens/Sync';

const MedicalStack = createStackNavigator({
  MedicalRecord: MedicalRecordScreen,
  Diagnoses: DiagnosesScreen,
  Allergies: AllergiesScreen,
  Medications: MedicationsScreen,
  Immunizations: ImmunizationsScreen,
  Vitals: VitalsScreen,
  ViewResource: ViewResourceScreen,
  SyncData: {
    screen: SyncDataScreen,
    navigationOptions: {
      title: 'Sync Data'
    }
  },
  UnderConstruction: UnderConstructionScreen
});

const ProfileStack = createStackNavigator({
  Profile: ProfileScreen,
  ProfileEdit: ProfileEditScreen
});

const AppStack = createBottomTabNavigator(
  {
    Schedule: {
      screen: AppointmentIndexScreen,
      navigationOptions: {
        tabBarIcon: ({ tintColor: color }) => (
          <Icon style={{ color, marginTop: 6 }} name="ios-clock" />
        )
      }
    },
    Medical: {
      screen: MedicalStack,
      navigationOptions: {
        tabBarIcon: ({ tintColor: color }) => (
          <Icon style={{ color, marginTop: 6 }} name="ios-medical" />
        )
      }
    },
    Profile: {
      screen: ProfileStack,
      navigationOptions: {
        tabBarIcon: ({ tintColor: color }) => (
          <Icon style={{ color, marginTop: 6 }} name="ios-person" />
        )
      }
    }
  },
  {
    initialRouteName: 'Schedule',
    tabBarOptions: {
      activeTintColor: '#D95640',
      inactiveTintColor: '#B4B4B4'
    }
  }
);

const AuthStack = createStackNavigator({
  SignIn: SignInScreen,
  Dev: DevScreen
});

const App = createAppContainer(
  createSwitchNavigator(
    {
      AuthLoading: AuthLoadingScreen,
      PatientLoading: PatientLoadingScreen,
      App: AppStack,
      Auth: {
        screen: AuthStack,
        path: 'auth',
        query: {}
      }
    },
    {
      initialRouteName: 'AuthLoading'
    }
  )
);
const prefix = 'aidbox://';

export default () => (
  <Root>
    <App uriPrefix={prefix} />
  </Root>
);

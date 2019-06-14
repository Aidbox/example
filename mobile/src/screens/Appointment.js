import React from 'react';
import { RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import moment from 'moment';

import { Container, Content, Text, Spinner, Icon } from 'native-base';

import { get } from '../lib/http';

import ViewBG from '../components/ViewBG';
import Header from '../components/Header';
import Title from '../components/Title';

import ItemCard, { ItemCardLine, ItemCardTitle } from '../components/ItemCard';

export default class AppointmentIndexScreen extends React.Component {
  static navigationOptions = {
    title: 'Schedule'
  };

  ref = null;

  state = {
    refreshing: false,
    data: []
  };

  componentDidMount() {
    this._getData();
  }

  _getAppointment = async () => {
    const resp = await get({
      url: `/Appointment`,
      params: { actor: this.ref, _sort: '-.start' }
    });
    if (resp && resp.data && resp.data.entry.length > 0) {
      return resp.data.entry.map(({ resource }) => ({ ...resource }));
    }
    return [];
  };

  _getData = async () => {
    this.setState({ loading: true });
    try {
      const pt = await AsyncStorage.getItem('patient');
      const { id } = JSON.parse(pt);
      this.ref = `Patient/${id}`;
      const data = await this._getAppointment();
      this.setState({ data, loading: false });
    } catch (err) {
      this.setState({ loading: false });
      // eslint-disable-next-line
      console.log(err);
    }
  };

  _getPractitioner(p) {
    const practitioner = p.find(v => v.type);
    return practitioner ? practitioner.actor.display : '';
  }

  renderItem(item) {
    return (
      <ItemCard key={item.id}>
        <ItemCardTitle>
          <Icon name="clock" type="EvilIcons" style={{ marginRight: 8 }} />
          <Text>
            {moment(item.start).format('D MMMM')} at{' '}
            {moment(item.start).format('HH:mm')}
            {'  '}
            <Text note>~ {item.minutesDuration} min</Text>
          </Text>
        </ItemCardTitle>
        <ItemCardLine />
        <Text style={{ marginBottom: 8 }}>
          <Text style={{ fontWeight: 'bold' }}>Dr.</Text>{' '}
          {this._getPractitioner(item.participant)}
        </Text>
        <Text note>
          Comment:{' '}
          {item.patientInstruction ? `${item.patientInstruction}. ` : null}
          {item.description ? `${item.description}. ` : null}
          {item.comment ? `${item.comment}.` : null}
        </Text>
      </ItemCard>
    );
  }

  render() {
    const { data, loading, refreshing } = this.state;
    return (
      <Container style={{ backgroundColor: '#fafafa' }}>
        <ViewBG />
        <Header />
        <Content
          style={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              tintColor="#fff"
              onRefresh={async () => {
                this.setState({ refreshing: true });
                await this._getData();
                this.setState({ refreshing: false });
              }}
            />
          }
        >
          <Title>Schedule</Title>
          {loading && data.length === 0 && <Spinner color="#fff" />}
          {!loading && data.length === 0 && (
            <ItemCard style={{ paddingTop: 55, paddingBottom: 55 }}>
              <Text>No scheduled visits</Text>
            </ItemCard>
          )}
          {data && data.length > 0 && data.map(v => this.renderItem(v))}
        </Content>
      </Container>
    );
  }
}

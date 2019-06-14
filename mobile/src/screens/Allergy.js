import React from 'react';
import { RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import moment from 'moment';
import { JSONPath } from 'jsonpath-plus';

import {
  Container,
  Content,
  Text,
  Spinner,
  Button,
  Icon,
  View
} from 'native-base';

import Header from '../components/Header';
import Title from '../components/Title';
import ViewBG from '../components/ViewBG';

import ItemCard, { ItemCardLine, ItemCardTitle } from '../components/ItemCard';

import { get } from '../lib/http';

import { capitalize } from '../lib/helpers';

export default class AllergyIndexScreen extends React.Component {
  static navigationOptions = {
    header: null
  };

  ref = null;

  state = {
    refreshing: false,
    first: true,
    data: []
  };

  componentDidMount() {
    this._getData();
  }

  getManifestation(v) {
    const a = JSONPath({
      path: '$.reaction[0].manifestation[*].text',
      json: v
    });
    const b = JSONPath({
      path: '$.reaction[0].manifestation[*].coding[*].display',
      json: v
    });
    return [].concat(a, b);
  }

  _getAllergies = async () => {
    const resp = await get({
      url: `/AllergyIntolerance`,
      params: { patient: this.ref }
    });
    if (resp && resp.data && resp.data.entry.length > 0) {
      return resp.data.entry.map(({ resource }) => ({ ...resource }));
    }
    return [];
  };

  _getData = async () => {
    try {
      const pt = await AsyncStorage.getItem('patient');
      const { id } = JSON.parse(pt);
      this.ref = `Patient/${id}`;
      const data = await this._getAllergies();

      this.setState({ data, first: false });
    } catch (err) {
      this.setState({ first: false });
      // eslint-disable-next-line
      console.log(err);
    }
  };

  render() {
    const {
      navigation: { goBack }
    } = this.props;
    const { data, first, refreshing } = this.state;
    return (
      <Container style={{ backgroundColor: '#fafafa' }}>
        <ViewBG />
        <Header
          left={
            <Button
              style={{ marginLeft: 8 }}
              transparent
              onPress={() => goBack()}
            >
              <Icon
                style={{ color: '#fff', opacity: 0.9 }}
                name="ios-arrow-round-back"
              />
            </Button>
          }
        />
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
          <Title>Allergies</Title>
          {first && <Spinner color="#fff" />}
          {(!data || data.length === 0) && !first && (
            <ItemCard style={{ paddingTop: 55, paddingBottom: 55 }}>
              <Text>No known allergies</Text>
            </ItemCard>
          )}
          {data.map(v => (
            <ItemCard key={v.id}>
              <ItemCardTitle>
                <Text style={{ fontWeight: 'bold' }}>
                  {JSONPath({
                    path: '$.reaction[0].substance.coding[0].display',
                    json: v
                  })}{' '}
                  (
                  {JSONPath({
                    path: '$.reaction[0].substance.coding[0].code',
                    json: v
                  })}
                  )
                </Text>
              </ItemCardTitle>
              <ItemCardLine />
              <Text style={{ marginBottom: 8 }}>
                Status:{' '}
                {capitalize(
                  JSONPath({
                    path: '$.clinicalStatus.coding[0].display',
                    json: v
                  })[0] || 'Unknown'
                )}
              </Text>
              <Text style={{ marginBottom: 8 }}>
                Severity:{' '}
                {capitalize(
                  JSONPath({
                    path: '$.reaction[0].severity',
                    json: v
                  })[0]
                )}
              </Text>
              <Text style={{ marginBottom: 8 }}>
                Manifestation: {this.getManifestation(v).join(', ')}
              </Text>
              <ItemCardLine />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between'
                }}
              >
                <Text note style={{ textAlign: 'left' }}>
                  Recorded: {moment(v.onset.dateTime).format('MM/DD/YYYY')}
                </Text>
                <Text note style={{ textAlign: 'right' }}>
                  On set: {moment(v.recordedDate).format('MM/DD/YYYY')}
                </Text>
              </View>
            </ItemCard>
          ))}
        </Content>
      </Container>
    );
  }
}

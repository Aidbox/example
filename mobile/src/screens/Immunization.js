import React from 'react';
import { RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import { JSONPath } from 'jsonpath-plus';
import moment from 'moment';

import { Container, Content, Text, Spinner, Button, Icon } from 'native-base';

import Header from '../components/Header';
import Title from '../components/Title';
import ViewBG from '../components/ViewBG';

import ItemCard, { ItemCardLine, ItemCardTitle } from '../components/ItemCard';

import { get } from '../lib/http';

export default class ImmunizationIndexScreen extends React.Component {
  static navigationOptions = {
    header: null
  };

  ref = null;

  state = {
    first: true,
    refreshing: false,
    data: []
  };

  componentDidMount() {
    this._getData();
  }

  _getImmunizations = async () => {
    const resp = await get({
      url: `/Immunization`,
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

      const data = await this._getImmunizations();

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
          <Title>Immunizations</Title>
          {first && <Spinner color="#fff" />}
          {(!data || data.length === 0) && !first && (
            <ItemCard style={{ paddingTop: 55, paddingBottom: 55 }}>
              <Text>No immunizations</Text>
            </ItemCard>
          )}
          {data.map(v => (
            <ItemCard key={v.id}>
              <ItemCardTitle>
                <Text style={{ fontWeight: 'bold' }}>
                  {JSONPath({
                    path: '$.vaccineCode.text',
                    json: v
                  })}{' '}
                  (
                  {JSONPath({
                    path: '$.vaccineCode.coding[0].code',
                    json: v
                  })}
                  )
                </Text>
              </ItemCardTitle>
              <ItemCardLine />
              <Text style={{ marginBottom: 8 }}>
                Dose:{' '}
                {JSONPath({
                  path: '$.doseQuantity.value',
                  json: v
                })}
                /
                {JSONPath({
                  path: '$.doseQuantity.code',
                  json: v
                })}
              </Text>
              <Text style={{ marginBottom: 8 }}>
                Route:{' '}
                {JSONPath({
                  path: '$.route.coding[*].display',
                  json: v
                })}
              </Text>
              <Text style={{ marginBottom: 8 }}>
                Body site:{' '}
                {JSONPath({
                  path: '$.site.coding[*].display',
                  json: v
                }).join(', ')}
              </Text>
              <Text style={{ marginBottom: 8 }}>
                Note:{' '}
                {JSONPath({
                  path: '$.note[*].text',
                  json: v
                }).join(', ')}
              </Text>
              <ItemCardLine />
              <Text note>
                Occurrence:{' '}
                {moment(v.occurrence.dateTime).format('MM/DD/YYYY')}
              </Text>
            </ItemCard>
          ))}
        </Content>
      </Container>
    );
  }
}

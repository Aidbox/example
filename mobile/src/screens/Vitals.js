import React from 'react';
import { RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {
  Container,
  Content,
  Text,
  Spinner,
  Button,
  Icon,
  View
} from 'native-base';

// import { Path } from 'react-native-svg';
import * as shape from 'd3-shape';
import { AreaChart } from 'react-native-svg-charts';

import Header from '../components/Header';
import Title from '../components/Title';
import ViewBG from '../components/ViewBG';

import ItemCard, { ItemCardLine, ItemCardTitle } from '../components/ItemCard';

import { get } from '../lib/http';
import { formatDate } from '../lib/helpers';

// const Line = ({ line }) => (
//   <Path key="line" d={line} stroke="#cacaca" strokeWidth="2" fill="none" />
// );

const mapps = {
  HeartRate: { title: 'Heart Rate', code: '8867-4' },
  Weight: { title: 'Weight', code: '33141-3' },
  Height: { title: 'Height', code: '8302-2' },
  InhalerUsage: { title: 'Inhaler Usage', code: '420317006' }
};

export default class VitalsScreen extends React.Component {
  static navigationOptions = {
    header: null
  };

  state = {
    title: 'Vital Signs',
    error: null,
    first: true,
    refreshing: false,
    chart: null,
    data: null,
    loadingNext: false,
    nextPage: null
  };

  async componentDidMount() {
    const {
      navigation: { getParam }
    } = this.props;
    const type = getParam('type');
    if (!type || type.length === 0 || !(type in mapps)) {
      return;
    }
    this.type = type;
    const title = mapps[type] ? mapps[type].title : 'Vital Signs';
    this.setState({ title });
    const pt = await AsyncStorage.getItem('patient');
    const { id } = JSON.parse(pt);
    this.ref = `Patient/${id}`;
    this._getData();
  }

  _getObsByCode = async (code, page = 1) => {
    const resp = await get({
      url: `/Observation`,
      params: {
        subject: this.ref,
        code,
        _sort: '-.effective.dateTime',
        _page: page
      }
    });
    if (resp.data.link.find(v => v.relation === 'next')) {
      this.setState({ nextPage: page + 1 });
    } else {
      this.setState({ nextPage: null });
    }
    console.log(this.nextPage);
    if (resp && resp.data && resp.data.entry.length > 0) {
      return resp.data.entry.map(v => ({ ...v.resource }));
    }
    return null;
  };

  _getData = async () => {
    try {
      const { code } = mapps[this.type];
      const res = await this._getObsByCode(code);
      const data = [];
      if (res && Array.isArray(res)) {
        res.forEach(v => {
          const d = formatDate(v.effective.dateTime, 'date');
          const oI = data.findIndex(dv => dv.date === d);
          if (oI === -1) {
            data.push({ date: d, list: [v] });
          } else {
            data[oI].list.push(v);
          }
        });
      }
      const chart =
        res && Array.isArray(res)
          ? res.map(v => parseInt(v.value.Quantity.value, 10))
          : [];
      if (chart.length > 50) {
        chart.splice(0, 50);
      }
      this.setState({
        data,
        chart,
        first: false
      });
    } catch (err) {
      this.setState({ error: err.message, first: false });
    }
  };

  _getNextPage = async () => {
    this.setState({ loadingNext: true });
    try {
      const { code } = mapps[this.type];
      const res = await this._getObsByCode(code);
      const newData = [];
      res.forEach(v => {
        const d = formatDate(v.effective.dateTime, 'date');
        const oI = newData.findIndex(dv => dv.date === d);
        if (oI === -1) {
          newData.push({ date: d, list: [v] });
        } else {
          newData[oI].list.push(v);
        }
      });
      const { data } = this.state;
      this.setState({
        data: [].concat(data, newData),
        loadingNext: false
      });
    } catch (err) {
      this.setState({ error: err.message, loadingNext: false });
    }
  };

  isCloseToBottom({ layoutMeasurement, contentOffset, contentSize }) {
    return (
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 50
    );
  }

  calcMax(chart) {
    const max = Math.max(...chart);
    return max;
  }

  calcMin(chart) {
    const min = Math.min(...chart);
    return min - 1;
  }

  render() {
    const {
      navigation: { goBack }
    } = this.props;
    const {
      title,
      first,
      error,
      data,
      chart,
      refreshing,
      nextPage,
      loadingNext
    } = this.state;
    return (
      <Container style={{ backgroundColor: '#fafafa' }}>
        <ViewBG style={{ height: 288 }} />
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
          onScroll={({ nativeEvent }) => {
            if (this.isCloseToBottom(nativeEvent) && nextPage && !loadingNext) {
              this._getNextPage();
            }
          }}
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
          <View style={{ padding: 16 }}>
            <Title>{title}</Title>
            {error && (
              <Text style={{ color: 'red', fontSize: 14, textAlign: 'center' }}>
                {error}
              </Text>
            )}
            {first && <Spinner color="#fff" />}
            {(!data || data.length === 0) && !first && (
              <ItemCard style={{ paddingTop: 55, paddingBottom: 55 }}>
                <Text>Empty</Text>
              </ItemCard>
            )}
          </View>
          {chart && chart.length > 3 && (
            <AreaChart
              curve={shape.curveNatural}
              yMax={this.calcMax(chart)}
              yMin={this.calcMin(chart)}
              animate
              animationDuration={600}
              style={{
                height: 100,
                padding: 0,
                borderBottomColor: '#cacaca',
                borderBottomWidth: 1
              }}
              data={chart}
              svg={{ fill: 'rgba(255, 255, 255, 0.5)' }}
              showGrid={false}
            />
          )}
          <View style={{ padding: 16 }}>
            {data &&
              data.length > 0 &&
              data.map((date, i) => (
                <ItemCard key={`${date.date}-${i}`}>
                  <ItemCardTitle>
                    <Text style={{ fontWeight: 'bold' }}>{date.date}</Text>
                  </ItemCardTitle>
                  <ItemCardLine />
                  {date.list.map((item, ii) => (
                    <View key={item.id}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom: 8
                        }}
                      >
                        <Text style={{ textAlign: 'left' }}>
                          {formatDate(item.effective.dateTime, 'hours')}
                        </Text>
                        <Text style={{ textAlign: 'right' }}>
                          {parseFloat(item.value.Quantity.value).toFixed(0)}{' '}
                          <Text note>{item.value.Quantity.unit}</Text>
                        </Text>
                      </View>
                      {date.list.length > ii + 1 && <ItemCardLine />}
                    </View>
                  ))}
                </ItemCard>
              ))}
            {loadingNext && <Spinner color="#7C003E" />}
            <View style={{ height: 60 }} />
          </View>
        </Content>
      </Container>
    );
  }
}

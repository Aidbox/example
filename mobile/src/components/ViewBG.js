import React from 'react';
import { Dimensions, ImageBackground } from 'react-native';
import { View } from 'native-base';

import bg from '../../static/bg.png';

const { height } = Dimensions.get('window');

const defaultStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: (height - 100) / 3
};

export default ({ children, style = {} }) => (
  <View style={{ ...defaultStyle, ...style }}>
    <ImageBackground
      source={bg}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0
      }}
    />
    {children}
  </View>
);

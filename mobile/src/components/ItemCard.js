import React from 'react';

import { TouchableOpacity } from 'react-native';

import { View, Icon } from 'native-base';

const lineDefaultStyles = {
  height: 0.5,
  backgroundColor: '#cccccc',
  opacity: 0.5,
  marginBottom: 8
};

export const ItemCardLine = ({ style }) => (
  <View style={{ ...lineDefaultStyles, ...style }} />
);

const titleDefaultStyles = {
  flexDirection: 'row',
  marginBottom: 8,
  alignItems: 'center'
};

export const ItemCardTitle = ({ onPress, children, style }) =>
  onPress ? (
    <TouchableOpacity
      onPress={onPress}
      style={{ ...titleDefaultStyles, ...style }}
    >
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        {children}
      </View>
      <Icon style={{ color: '#A8A7A8', fontSize: 16 }} name="arrow-forward" />
    </TouchableOpacity>
  ) : (
    <View style={{ ...titleDefaultStyles, ...style }}>{children}</View>
  );

const itemDefayltStyles = {
  backgroundColor: '#fff',
  borderRadius: 6,
  marginBottom: 8,
  padding: 16,
  shadowOffset: { width: 1, height: 1 },
  shadowColor: '#cccccc',
  shadowOpacity: 0.4
};

export default ({ onPress, style, children }) =>
  onPress ? (
    <TouchableOpacity
      onPress={onPress}
      style={{ ...itemDefayltStyles, ...style }}
    >
      {children}
    </TouchableOpacity>
  ) : (
    <View style={{ ...itemDefayltStyles, ...style }}>{children}</View>
  );

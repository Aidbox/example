import React from 'react';

import { JSONPath } from 'jsonpath-plus';

import { TouchableOpacity } from 'react-native';

import { Text, Icon, View } from 'native-base';

const Label = ({ children }) => (
  <Text style={{ marginRight: 8 }} ellipsizeMode="tail" numberOfLines={1}>
    {children}
  </Text>
);

const Value = ({ children }) => (
  <Text style={{ flex: 1 }} note ellipsizeMode="tail" numberOfLines={1}>
    {children}
  </Text>
);

const GoIcon = () => (
  <Icon style={{ color: '#A8A7A8', fontSize: 16 }} name="arrow-forward" />
);

const TStyle = {
  flexDirection: 'row',
  alignItems: 'baseline',
  marginBottom: 8
};

const TouchOrNot = ({ onPress, children }) =>
  onPress ? (
    <TouchableOpacity onPress={onPress} style={TStyle}>
      {children}
    </TouchableOpacity>
  ) : (
    <View style={TStyle}>{children}</View>
  );

export const DiagnosesItem = ({ resource, onPress }) => (
  <TouchOrNot onPress={onPress}>
    <Label>
      {JSONPath({
        path: '$.code.text',
        json: resource
      })}
    </Label>
    <Value>
      {JSONPath({
        path: '$.code.coding[0].code',
        json: resource
      })}
    </Value>
    {onPress && <GoIcon />}
  </TouchOrNot>
);

const getAllergyName = resource => {
  const nr = JSONPath({
    path: '$.reaction[0].substance.coding[0].display',
    json: resource
  });
  const nc = JSONPath({
    path: '$.code.coding[0].display',
    json: resource
  });
  if (nc && nc.length > 0) {
    return nc[0];
  }
  return nr[0];
};

const getAllergyCode = resource => {
  const nr = JSONPath({
    path: '$.reaction[0].substance.coding[0].code',
    json: resource
  });
  const nc = JSONPath({
    path: '$.code.coding[0].code',
    json: resource
  });
  if (nc && nc.length > 0) {
    return nc[0];
  }
  return nr[0];
};

export const AllergiesItem = ({ resource, onPress }) => (
  <TouchOrNot onPress={onPress}>
    <Label>{getAllergyName(resource)}</Label>
    <Value>{getAllergyCode(resource)}</Value>
    {onPress && <GoIcon />}
  </TouchOrNot>
);

export const MedicationsItem = ({ resource, onPress }) => (
  <TouchOrNot onPress={onPress}>
    <Label>
      {JSONPath({
        path: '$.medication.CodeableConcept.coding[0].display',
        json: resource
      })}
    </Label>
    <Value>
      {JSONPath({
        path: '$.medication.CodeableConcept.coding[0].code',
        json: resource
      })}
    </Value>
    {onPress && <GoIcon />}
  </TouchOrNot>
);

export const ImmunizationsItem = ({ resource, onPress }) => (
  <TouchOrNot onPress={onPress}>
    <Label>
      {JSONPath({
        path: '$.vaccineCode.text',
        json: resource
      })}
    </Label>
    <Value>
      {JSONPath({
        path: '$.vaccineCode.coding[0].code',
        json: resource
      })}
    </Value>
    {onPress && <GoIcon />}
  </TouchOrNot>
);

export const VitItem = ({ onPress, title, date, value }) => (
  <TouchableOpacity style={TStyle} onPress={onPress}>
    <Label>{title}</Label>
    <Text note>{date}</Text>
    <Text style={{ textAlign: 'right', flex: 1, marginRight: 8 }}>{value}</Text>
    <GoIcon />
  </TouchableOpacity>
);

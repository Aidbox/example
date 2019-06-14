import React from 'react';

import { Header, Left, Body, Right } from 'native-base';

export default ({ left, right, body }) => (
  <Header
    style={{
      left: 0,
      top: 0,
      backgroundColor: 'transparent',
      borderBottomWidth: 0
    }}
  >
    {left ? <Left>{left}</Left> : <Left />}
    {body && <Body />}
    {right ? <Right>{right}</Right> : <Right />}
  </Header>
);

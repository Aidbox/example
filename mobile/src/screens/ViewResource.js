import React from 'react';

import { Container, Content, Text } from 'native-base';

export default ({ navigation: { getParam } }) => (
  <Container>
    <Content style={{ padding: 16 }}>
      <Text>{getParam('resource')}</Text>
    </Content>
  </Container>
);

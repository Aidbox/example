import React from 'react';

import { Container, Content, H1, View } from 'react-native';

export default ({ title, refreshControl, children }) => {
  console.log(title, refreshControl, children);
  return (
    <Container style={{ paddingTop: 36 }}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 160,
          backgroundColor: '#F4F4F4'
        }}
      />
      <Content style={{ padding: 16 }} refreshControl={refreshControl}>
        {title && (
          <H1 style={{ fontWeight: 'bold', marginBottom: 16 }}>{title}</H1>
        )}
        {children}
      </Content>
    </Container>
  );
};

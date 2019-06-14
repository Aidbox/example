import React from 'react';

import { H1 } from 'native-base';

export default ({ children }) => (
  <H1
    style={{
      fontWeight: 'bold',
      marginBottom: 16,
      marginTop: 20,
      color: '#fff'
    }}
  >
    {children}
  </H1>
);

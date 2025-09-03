import React from 'react';

import { Th, Text } from '@citizenlab/cl2-component-library';

const ColHeader = ({ children }: { children: React.ReactNode }) => (
  <Th py="16px">
    <Text m="0" fontSize="s" fontWeight="bold">
      {children}
    </Text>
  </Th>
);

export default ColHeader;

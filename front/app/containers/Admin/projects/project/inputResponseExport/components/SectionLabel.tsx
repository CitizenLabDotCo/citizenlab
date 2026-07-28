import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Text
    fontSize="s"
    fontWeight="bold"
    color="textSecondary"
    m="0px"
    style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
  >
    {children}
  </Text>
);

export default SectionLabel;

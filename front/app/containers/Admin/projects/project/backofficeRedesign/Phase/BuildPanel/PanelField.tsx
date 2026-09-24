import React, { ReactNode } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

interface Props {
  label: ReactNode;
  children: ReactNode;
}

const PanelField = ({ label, children }: Props) => (
  <Box mb="16px">
    <Text variant="bo-section" mb="8px">
      {label}
    </Text>
    {children}
  </Box>
);

export default PanelField;

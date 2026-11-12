import React, { ReactNode } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

interface Props {
  label: string;
  children: ReactNode;
}

const PropertyRow = ({ label, children }: Props) => (
  <Box display="flex" alignItems="flex-start" gap="8px" minHeight="24px">
    <Box flex="0 0 64px" pt="3px">
      <Text variant="boHelper" fontSize="xs" m="0">
        {label}
      </Text>
    </Box>
    <Box
      display="flex"
      alignItems="center"
      flexWrap="wrap"
      gap="6px"
      flexGrow={1}
      minHeight="24px"
    >
      {children}
    </Box>
  </Box>
);

export default PropertyRow;

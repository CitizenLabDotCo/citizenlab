import React, { ReactNode } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

interface Props {
  label: string;
  children: ReactNode;
}

const PropertyRow = ({ label, children }: Props) => (
  <Box display="flex" alignItems="flex-start" gap="12px" minHeight="32px">
    <Box flex="0 0 96px" pt="6px">
      <Text m="0" fontSize="s" color="coolGrey600">
        {label}
      </Text>
    </Box>
    <Box
      display="flex"
      alignItems="center"
      flexWrap="wrap"
      gap="6px"
      flexGrow={1}
      minHeight="32px"
    >
      {children}
    </Box>
  </Box>
);

export default PropertyRow;

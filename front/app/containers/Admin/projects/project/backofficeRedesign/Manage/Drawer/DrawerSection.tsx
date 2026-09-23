import React, { ReactNode } from 'react';

import { Box, Divider, Text } from '@citizenlab/cl2-component-library';

interface Props {
  label: string;
  hint?: string;
  children: ReactNode;
}

const DrawerSection = ({ label, hint, children }: Props) => (
  <Box>
    <Divider my="16px" />
    <Text m="0" mb="8px" fontSize="s" color="textSecondary">
      {label}
    </Text>
    {hint && (
      <Text m="0" mb="8px" fontSize="xs" color="coolGrey600">
        {hint}
      </Text>
    )}
    {children}
  </Box>
);

export default DrawerSection;

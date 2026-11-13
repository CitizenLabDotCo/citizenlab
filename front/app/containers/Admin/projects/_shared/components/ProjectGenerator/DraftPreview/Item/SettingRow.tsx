import React, { ReactNode } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

type Props = {
  label: string;
  children: ReactNode;
};

const SettingRow = ({ label, children }: Props) => (
  <Box display="flex" alignItems="baseline" gap="12px" py="4px">
    <Box width="160px" flexShrink={0}>
      <Text m="0px" fontSize="s" color="textSecondary">
        {label}
      </Text>
    </Box>
    <Box flex="1" minWidth="0">
      {children}
    </Box>
  </Box>
);

export default SettingRow;

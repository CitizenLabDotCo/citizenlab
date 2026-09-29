import React from 'react';

import {
  Box,
  colors,
  stylingConsts,
  Text,
} from '@citizenlab/cl2-component-library';

interface Props {
  value: number;
  label: string;
}

const StatTile = ({ value, label }: Props) => (
  <Box
    flex="1 1 0"
    p="12px"
    border={`1px solid ${colors.grey300}`}
    borderRadius={stylingConsts.borderRadius}
  >
    <Text m="0" fontSize="xl" fontWeight="bold">
      {value}
    </Text>
    <Text m="0" fontSize="s" color="coolGrey600">
      {label}
    </Text>
  </Box>
);

export default StatTile;

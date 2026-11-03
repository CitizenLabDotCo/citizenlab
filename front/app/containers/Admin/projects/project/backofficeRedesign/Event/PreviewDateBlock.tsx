import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

interface Props {
  day: string;
  month: string;
  time: string;
}

const PreviewDateBlock = ({ day, month, time }: Props) => (
  <Box display="flex" flexDirection="column" alignItems="center">
    <Text m="0" fontWeight="bold" style={{ fontSize: '34px', lineHeight: '1' }}>
      {day}
    </Text>
    <Text m="0" fontSize="m" color="grey700">
      {month}
    </Text>
    <Text m="0" fontSize="l" fontWeight="semi-bold" textAlign="center">
      {time}
    </Text>
  </Box>
);

export default PreviewDateBlock;

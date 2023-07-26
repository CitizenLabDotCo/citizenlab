import React from 'react';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';

type Props = {
  day: string;
  month: string;
  time: string;
};

const SingleDateStylized = ({ day, month, time }: Props) => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Text
        m="0px"
        fontWeight="bold"
        style={{ fontSize: '34px', lineHeight: '1' }}
      >
        {day}
      </Text>
      <Text mt="0px" m="0px" fontWeight="normal" fontSize="m" color="grey700">
        {month}
      </Text>
      <Text m="0px" fontWeight="bold" fontSize="l" style={{ fontWeight: 600 }}>
        {time}
      </Text>
    </Box>
  );
};

export default SingleDateStylized;

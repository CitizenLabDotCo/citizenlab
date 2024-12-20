import React from 'react';

import { Box, colors, Text } from '@citizenlab/cl2-component-library';

interface Props {
  phaseNumber: number;
}

const CircledPhaseNumber = ({ phaseNumber }: Props) => {
  return (
    <Box
      width="24px"
      height="24px"
      border={`1px solid ${colors.teal}`}
      borderRadius="50%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      background={colors.white}
    >
      <Text m="0" as="span" fontWeight="bold" fontSize="xs" color="teal">
        {phaseNumber}
      </Text>
    </Box>
  );
};

export default CircledPhaseNumber;

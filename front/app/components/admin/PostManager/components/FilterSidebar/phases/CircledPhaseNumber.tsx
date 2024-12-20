import React from 'react';

import { Box, Color, colors, Text } from '@citizenlab/cl2-component-library';

interface Props {
  phaseNumber: number;
  borderColor?: Color;
}

const CircledPhaseNumber = ({ phaseNumber, borderColor }: Props) => {
  return (
    <Box
      width="24px"
      height="24px"
      border={`1px solid ${borderColor ? colors[borderColor] : colors.teal}`}
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

import React from 'react';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';

// styling
import { colors } from 'utils/styleUtils';

interface Props {
  label: string;
  children: React.ReactNode;
}

const TooltipOutline = ({ label, children }: Props) => (
  <Box
    background="white"
    px="8px"
    py="8px"
    border={`1px solid ${colors.divider}`}
  >
    <Text
      color="primary"
      fontWeight="bold"
      textAlign="left"
      fontSize="s"
      mt="0px"
      mb="4px"
    >
      {label}
    </Text>

    {children}
  </Box>
);

export default TooltipOutline;

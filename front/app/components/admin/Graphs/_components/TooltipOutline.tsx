import React from 'react';

// components
import { Box, Text, colors } from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';

interface Props {
  label: string;
  children: React.ReactNode;
}

const ToolTipBox = styled(Box)`
  @media print {
    display: none;
  }
`;

const TooltipOutline = ({ label, children }: Props) => (
  <ToolTipBox
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
  </ToolTipBox>
);

export default TooltipOutline;

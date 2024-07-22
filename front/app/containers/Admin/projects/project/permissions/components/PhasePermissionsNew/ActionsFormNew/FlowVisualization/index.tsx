import React from 'react';

import { Box, stylingConsts, colors } from '@citizenlab/cl2-component-library';

const FlowVisualization = () => {
  return (
    <Box display="flex" flexDirection="row">
      <Block number={1} text="Enter and confirm email (or sign up with SSO)" />
      <Edge />
      <Block number={2} text="Something else" />
    </Box>
  );
};

interface BlockProps {
  number: number;
  text: string;
}

const Block = ({ number, text }: BlockProps) => {
  return (
    <Box
      borderRadius={stylingConsts.borderRadius}
      border={`1px solid ${colors.blue700}`}
      bgColor={colors.teal50}
      p="20px"
      w="220px"
    >
      <Box>{`${number}.`}</Box>
      <Box>{text}</Box>
    </Box>
  );
};

const Edge = () => {
  return (
    <Box w="20px" display="flex" flexDirection="column" justifyContent="center">
      <Box w="100%" borderBottom={`1px solid ${colors.blue700}`} h="1px" />
    </Box>
  );
};

export default FlowVisualization;

import React from 'react';

import { Box, stylingConsts, colors } from '@citizenlab/cl2-component-library';

const FlowVisualization = () => {
  return (
    <Box display="flex" flexDirection="row">
      <Box
        borderRadius={stylingConsts.borderRadius}
        border={`1px solid ${colors.blue700}`}
        p="20px"
      >
        <Box>1.</Box>
        <Box>Enter and confirm email (or sign up with SSO)</Box>
      </Box>
    </Box>
  );
};

export default FlowVisualization;

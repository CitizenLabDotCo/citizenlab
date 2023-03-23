import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import SSOButton from './SSOButton';

const SSOButtons = () => {
  return (
    <Box mt="32px">
      <SSOButton ssoProvider="google" />
      <SSOButton ssoProvider="facebook" />
      <SSOButton ssoProvider="franceconnect" />
      <SSOButton ssoProvider="azureAd" />
    </Box>
  );
};

export default SSOButtons;

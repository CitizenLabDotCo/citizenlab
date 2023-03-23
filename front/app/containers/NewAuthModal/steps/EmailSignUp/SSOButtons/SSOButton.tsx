import React from 'react';

// components
import { Box, Icon } from '@citizenlab/cl2-component-library';

interface Props {
  ssoProvider: 'google' | 'facebook' | 'franceconnect' | 'azureAd';
}

const SSOButton = ({ ssoProvider }: Props) => {
  if (ssoProvider === 'franceconnect' || ssoProvider === 'azureAd') {
    return null;
  }

  return (
    <Box display="flex" flexDirection="row" justifyContent="flex-start">
      <Icon name={ssoProvider} width="18px" height="18px" />
      <button>Bla bla</button>
    </Box>
  );
};

export default SSOButton;

import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import SSOButton from './SSOButton';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

const SSOButtons = () => {
  const googleLoginEnabled = useFeatureFlag({ name: 'google_login' });
  // azureAdLoginEnabled: <GetFeatureFlag name="azure_ad_login" />,
  // facebookLoginEnabled: <GetFeatureFlag name="facebook_login" />,
  // franceconnectLoginEnabled: <GetFeatureFlag name="franceconnect_login" />,

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

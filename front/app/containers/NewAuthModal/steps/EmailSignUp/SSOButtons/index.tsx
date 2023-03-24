import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import SSOButton from './SSOButton';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

const SSOButtons = () => {
  const googleLoginEnabled = useFeatureFlag({ name: 'google_login' });
  const facebookLoginEnabled = useFeatureFlag({ name: 'facebook_login' });
  const franceconnectLoginEnabled = useFeatureFlag({
    name: 'franceconnect_login',
  });
  const azureAdLoginEnabled = useFeatureFlag({ name: 'azure_ad_login' });

  if (
    !googleLoginEnabled &&
    !facebookLoginEnabled &&
    !franceconnectLoginEnabled &&
    !azureAdLoginEnabled
  ) {
    return null;
  }

  return (
    <Box mt="32px">
      {googleLoginEnabled && <SSOButton ssoProvider="google" />}
      {facebookLoginEnabled && <SSOButton ssoProvider="facebook" />}
      {franceconnectLoginEnabled && <SSOButton ssoProvider="franceconnect" />}
      {azureAdLoginEnabled && <SSOButton ssoProvider="azureactivedirectory" />}
    </Box>
  );
};

export default SSOButtons;

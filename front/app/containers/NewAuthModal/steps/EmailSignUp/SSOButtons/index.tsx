import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import SSOButton from './SSOButton';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// typings
import { SSOProviderWithoutVienna } from 'containers/NewAuthModal/typings';

interface Props {
  onClickSSO: (ssoProvider: SSOProviderWithoutVienna) => void;
}

const SSOButtons = ({ onClickSSO }: Props) => {
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
      {googleLoginEnabled && (
        <SSOButton ssoProvider="google" onClickSSO={onClickSSO} />
      )}
      {facebookLoginEnabled && (
        <SSOButton ssoProvider="facebook" onClickSSO={onClickSSO} />
      )}
      {franceconnectLoginEnabled && (
        <SSOButton ssoProvider="franceconnect" onClickSSO={onClickSSO} />
      )}
      {azureAdLoginEnabled && (
        <SSOButton ssoProvider="azureactivedirectory" onClickSSO={onClickSSO} />
      )}
    </Box>
  );
};

export default SSOButtons;

import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import SSOButton from './SSOButton';
import Or from 'components/UI/Or';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// typings
import { SSOProviderWithoutVienna } from 'containers/NewAuthModal/typings';

interface Props {
  onClickSSO: (ssoProvider: SSOProviderWithoutVienna) => void;
}

const SSOButtons = (props: Props) => {
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
    <>
      <Box mt="32px">
        <Or />
      </Box>
      <Box mt="32px">
        {googleLoginEnabled && <SSOButton ssoProvider="google" {...props} />}
        {facebookLoginEnabled && (
          <SSOButton ssoProvider="facebook" {...props} />
        )}
        {franceconnectLoginEnabled && (
          <SSOButton ssoProvider="franceconnect" {...props} />
        )}
        {azureAdLoginEnabled && (
          <SSOButton ssoProvider="azureactivedirectory" {...props} />
        )}
      </Box>
    </>
  );
};

export default SSOButtons;

import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { SSOProviderWithoutVienna } from 'containers/Authentication/typings';

import Error from 'components/UI/Error';
import Or from 'components/UI/Or';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import SSOButton from './SSOButton';

interface Props {
  onClickSSO: (ssoProvider: SSOProviderWithoutVienna) => void;
}

const SSOButtons = (props: Props) => {
  const { formatMessage } = useIntl();

  const passwordLoginEnabled = useFeatureFlag({ name: 'password_login' });
  const googleLoginEnabled = useFeatureFlag({ name: 'google_login' });
  const facebookLoginEnabled = useFeatureFlag({ name: 'facebook_login' });
  const azureAdLoginEnabled = useFeatureFlag({ name: 'azure_ad_login' });
  const franceconnectLoginEnabled = useFeatureFlag({
    name: 'franceconnect_login',
  });
  const claveUnicaLoginEnabled = useFeatureFlag({
    name: 'clave_unica_login',
  });
  const hoplrLoginEnabled = useFeatureFlag({
    name: 'hoplr_login',
  });

  if (
    !googleLoginEnabled &&
    !facebookLoginEnabled &&
    !azureAdLoginEnabled &&
    !franceconnectLoginEnabled &&
    !claveUnicaLoginEnabled &&
    !hoplrLoginEnabled
  ) {
    if (passwordLoginEnabled) {
      return null;
    }

    // This should never actually happen
    return (
      <Error text={formatMessage(messages.noAuthenticationMethodsEnabled)} />
    );
  }

  return (
    <>
      {passwordLoginEnabled && (
        <Box mt="32px" mb="20px">
          <Or />
        </Box>
      )}
      <Box>
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

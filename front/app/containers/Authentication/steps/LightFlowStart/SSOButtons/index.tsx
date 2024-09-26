import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { SSOProviderWithoutVienna } from 'containers/Authentication/typings';

import Error from 'components/UI/Error';
import Or from 'components/UI/Or';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import SSOButton from './SSOButton';
import { useSSOMethodsEnabled } from 'containers/Authentication/useAnySSOEnabled';

interface Props {
  onClickSSO: (ssoProvider: SSOProviderWithoutVienna) => void;
}

const SSOButtons = (props: Props) => {
  const { formatMessage } = useIntl();
  const passwordLoginEnabled = useFeatureFlag({ name: 'password_login' });
  const ssoMethodsEnabled = useSSOMethodsEnabled();

  if (ssoMethodsEnabled.indexOf(true) === -1) {
    if (passwordLoginEnabled) {
      return null;
    }

    // This should never actually happen
    return (
      <Error text={formatMessage(messages.noAuthenticationMethodsEnabled)} />
    );
  }

  const [
    fakeSsoEnabled,
    googleLoginEnabled,
    facebookLoginEnabled,
    azureAdLoginEnabled,
    azureAdB2cLoginEnabled,
    franceconnectLoginEnabled,
    viennaCitizenLoginEnabled,
    claveUnicaLoginEnabled,
    hoplrLoginEnabled,
    criiptoLoginEnabled,
    nemlogInLoginEnabled,
    bosaFasLoginEnabled,
  ] = ssoMethodsEnabled;

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
        {azureAdB2cLoginEnabled && (
          <SSOButton ssoProvider="azureactivedirectory_b2c" {...props} />
        )}
        {/* TODO: Add the missing SSO providers */}
        {fakeSsoEnabled && <></>}
        {viennaCitizenLoginEnabled && <></>}
        {claveUnicaLoginEnabled && <></>}
        {hoplrLoginEnabled && <></>}
        {criiptoLoginEnabled && <></>}
        {nemlogInLoginEnabled && <></>}
        {bosaFasLoginEnabled && <></>}
      </Box>
    </>
  );
};

export default SSOButtons;

import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { SSOProvider } from 'api/authentication/singleSignOn';

import { SetError } from 'containers/Authentication/typings';
import useAuthConfig from 'containers/Authentication/useAuthConfig';

import Or from 'components/UI/Or';

import sharedMessages from '../messages';

import AdminSignInLink from './AdminSignInLink';
import EmailForm from './EmailForm';
import FranceConnectBlock from './FranceConnectBlock';
import SSOButtonsExceptFC from './SSOButtonsExceptFC';
import useSSOProviders from './SSOButtonsExceptFC/providers';

interface Props {
  loading: boolean;
  setError: SetError;
  onSubmit: (email: string) => void;
  onSwitchToSSO: (ssoProvider: SSOProvider) => void;
}

// Default sign-in interface: FranceConnect, then email, then all other SSO
// methods (each only shown when its feature flag is enabled).
const DefaultVariant = ({
  loading,
  setError,
  onSubmit,
  onSwitchToSSO,
}: Props) => {
  const { passwordLoginEnabled, ssoProviders } = useAuthConfig();
  const { allProviders } = useSSOProviders();

  const anySSOProviderEnabledBesidesFC = allProviders.length > 0;

  return (
    <Box data-cy="email-flow-start">
      {ssoProviders.franceconnect && (
        <>
          <FranceConnectBlock onClick={onSwitchToSSO} />
          {(passwordLoginEnabled || anySSOProviderEnabledBesidesFC) && (
            <Box mt="24px">
              <Or />
            </Box>
          )}
        </>
      )}
      {passwordLoginEnabled && (
        <>
          <EmailForm
            loading={loading}
            topText={sharedMessages.enterYourEmailAddress}
            setError={setError}
            onSubmit={onSubmit}
          />
          {anySSOProviderEnabledBesidesFC && (
            <Box mt="24px">
              <Or />
            </Box>
          )}
        </>
      )}
      {anySSOProviderEnabledBesidesFC && (
        <SSOButtonsExceptFC onClickSSO={onSwitchToSSO} />
      )}
      <AdminSignInLink />
    </Box>
  );
};

export default DefaultVariant;

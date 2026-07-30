import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { SSOProvider } from 'api/authentication/singleSignOn';
import useIdMethods from 'api/id_methods/useIdMethods';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useSuperAdmin from 'hooks/useSuperAdmin';

import { SetError } from 'containers/Authentication/typings';

import Or from 'components/UI/Or';

import sharedMessages from '../messages';

import AdminSignInLink from './AdminSignInLink';
import FranceConnectBlock from './FranceConnectBlock';
import SSOButtonsExceptFC from './SSOButtonsExceptFC';
import StartForm from './StartForm';

interface Props {
  loading: boolean;
  setError: SetError;
  onSubmitEmail: (email: string) => void;
  onSubmitPhone: (phone: string) => void;
  onSwitchToSSO: (ssoProvider: SSOProvider) => void;
}

// Default sign-in interface: FranceConnect, then email, then all other SSO
// methods (each only shown when its feature flag is enabled).
const DefaultVariant = ({
  loading,
  setError,
  onSubmitEmail,
  onSubmitPhone,
  onSwitchToSSO,
}: Props) => {
  const { data: idMethods } = useIdMethods();
  const isSuperAdmin = useSuperAdmin();
  const passwordLoginEnabled =
    useFeatureFlag({ name: 'password_login' }) || isSuperAdmin;
  const franceConnectEnabled = !!idMethods?.data.find(
    (method) => method.attributes.name === 'franceconnect'
  );

  const authMethodsEnabledBesidesFC =
    idMethods?.data.filter((method) => {
      const isFC = method.attributes.name === 'franceconnect';
      const isAuthMethod = method.attributes.authentication_method;

      return !isFC && isAuthMethod;
    }) ?? [];

  return (
    <Box data-cy="email-flow-start">
      {franceConnectEnabled && (
        <>
          <FranceConnectBlock onClick={onSwitchToSSO} />
          {(passwordLoginEnabled || authMethodsEnabledBesidesFC.length > 0) && (
            <Box mt="24px">
              <Or />
            </Box>
          )}
        </>
      )}
      {passwordLoginEnabled && (
        <>
          <StartForm
            loading={loading}
            topText={sharedMessages.enterYourEmailAddress}
            setError={setError}
            onSubmitEmail={onSubmitEmail}
            onSubmitPhone={onSubmitPhone}
          />
          {authMethodsEnabledBesidesFC.length > 0 && (
            <Box mt="24px">
              <Or />
            </Box>
          )}
        </>
      )}
      {authMethodsEnabledBesidesFC.length > 0 && (
        <SSOButtonsExceptFC onClickSSO={onSwitchToSSO} />
      )}
      <AdminSignInLink />
    </Box>
  );
};

export default DefaultVariant;

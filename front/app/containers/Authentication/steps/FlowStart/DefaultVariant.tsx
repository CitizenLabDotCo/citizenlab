import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { SSOProvider } from 'api/authentication/singleSignOn';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useSuperAdmin from 'hooks/useSuperAdmin';

import { SetError, State } from 'containers/Authentication/typings';

import Or from 'components/UI/Or';

import sharedMessages from '../messages';

import AdminSignInLink from './_components/AdminSignInLink';
import FranceConnectBlock from './_components/FranceConnectBlock';
import SSOButtonsExceptFC from './_components/SSOButtonsExceptFC';
import StartForm from './_components/StartForm';
import useFranceConnectEnabled from './useFranceConnectEnabled';
import useVisibleIdMethodsExceptFC from './useVisibleIdMethodsExceptFC';

interface Props {
  loading: boolean;
  state: State;
  setError: SetError;
  onSubmitEmail: (email: string) => void;
  onSubmitPhone: (phone: string) => void;
  onSwitchToSSO: (ssoProvider: SSOProvider) => void;
}

// Default sign-in interface: FranceConnect, then email, then all other SSO
// methods (each only shown when its feature flag is enabled).
const DefaultVariant = ({
  loading,
  state,
  setError,
  onSubmitEmail,
  onSubmitPhone,
  onSwitchToSSO,
}: Props) => {
  const visibleIdMethodsExceptFC = useVisibleIdMethodsExceptFC();
  const franceConnectEnabled = useFranceConnectEnabled();
  const isSuperAdmin = useSuperAdmin();
  const passwordLoginEnabled =
    useFeatureFlag({ name: 'password_login' }) || isSuperAdmin;

  const authMethodsEnabledBesidesFC = visibleIdMethodsExceptFC.filter(
    (method) => method.attributes.authentication_method
  );

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
            state={state}
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

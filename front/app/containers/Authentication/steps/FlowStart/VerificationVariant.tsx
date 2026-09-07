import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { SSOProvider } from 'api/authentication/singleSignOn';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useSuperAdmin from 'hooks/useSuperAdmin';

import { SetError, State } from 'containers/Authentication/typings';

import Or from 'components/UI/Or';

import { useIntl } from 'utils/cl-intl';

import sharedMessages from '../messages';

import AdminSignInLink from './_components/AdminSignInLink';
import FranceConnectBlock from './_components/FranceConnectBlock';
import SSOButton from './_components/SSOButtonsExceptFC/SSOButton';
import StartForm from './_components/StartForm';
import VerificationWarning from './_components/VerificationWarning';
import messages from './messages';
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

/*
 * Interface shown when the action requires verification. It splits the methods
 * in two: at the top the methods that can verify (FranceConnect + any SSO
 * method that supports verification), and at the bottom the methods that can
 * only authenticate (email + the remaining SSO methods) — for those the user
 * first signs in and then verifies as a separate step.
 */
const VerificationVariant = ({
  loading,
  state,
  setError,
  onSubmitEmail,
  onSubmitPhone,
  onSwitchToSSO,
}: Props) => {
  const { formatMessage } = useIntl();
  const visibleIdMethodsExceptFC = useVisibleIdMethodsExceptFC();
  const franceConnectEnabled = useFranceConnectEnabled();
  const isSuperAdmin = useSuperAdmin();
  const passwordLoginEnabled =
    useFeatureFlag({ name: 'password_login' }) || isSuperAdmin;

  const authenticationOnlyMethodsExceptFC = visibleIdMethodsExceptFC.filter(
    ({ attributes: { authentication_method, verification_method } }) =>
      authentication_method && !verification_method
  );

  const authenticationVerificationMethodsExceptFC =
    visibleIdMethodsExceptFC.filter(
      ({ attributes: { authentication_method, verification_method } }) =>
        authentication_method && verification_method
    );

  const orLoginWithSection =
    passwordLoginEnabled || authenticationOnlyMethodsExceptFC.length > 0;

  return (
    <Box data-cy="email-flow-start">
      <VerificationWarning />

      {franceConnectEnabled && (
        <Box mb="18px">
          <FranceConnectBlock onClick={onSwitchToSSO} />
        </Box>
      )}
      {authenticationVerificationMethodsExceptFC.map((provider) => (
        <SSOButton
          key={provider.attributes.name}
          provider={provider.attributes.name}
          onClickSSO={onSwitchToSSO}
        />
      ))}

      {orLoginWithSection && (
        <>
          <Text mt="24px" mb="18px" fontWeight="bold" color="tenantText">
            {formatMessage(messages.orLoginWith)}
          </Text>
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
              {authenticationOnlyMethodsExceptFC.length > 0 && (
                <Box mt="24px">
                  <Or />
                </Box>
              )}
            </>
          )}
          {authenticationOnlyMethodsExceptFC.map((provider) => (
            <SSOButton
              key={provider.attributes.name}
              provider={provider.attributes.name}
              onClickSSO={onSwitchToSSO}
            />
          ))}
        </>
      )}

      <AdminSignInLink />
    </Box>
  );
};

export default VerificationVariant;

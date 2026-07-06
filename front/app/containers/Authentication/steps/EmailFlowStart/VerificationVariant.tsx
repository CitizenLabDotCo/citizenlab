import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { SSOProvider } from 'api/authentication/singleSignOn';
import useIdMethods from 'api/id_methods/useIdMethods';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useSuperAdmin from 'hooks/useSuperAdmin';

import { SetError } from 'containers/Authentication/typings';

import Or from 'components/UI/Or';

import { useIntl } from 'utils/cl-intl';

import sharedMessages from '../messages';

import AdminSignInLink from './AdminSignInLink';
import EmailForm from './EmailForm';
import FranceConnectBlock from './FranceConnectBlock';
import messages from './messages';
import SSOButton from './SSOButtonsExceptFC/SSOButton';
import VerificationWarning from './VerificationWarning';

interface Props {
  loading: boolean;
  setError: SetError;
  onSubmit: (email: string) => void;
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
  setError,
  onSubmit,
  onSwitchToSSO,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: idMethods } = useIdMethods();
  const isSuperAdmin = useSuperAdmin();
  const passwordLoginEnabled = useFeatureFlag({ name: 'password_login' }) || isSuperAdmin;
  const franceConnectEnabled = !!idMethods?.data.find((method) => method.attributes.name === 'franceconnect');

  const authenticationMethodsExceptFC = idMethods?.data.filter((method) => {
    const isFC = method.attributes.name !== 'franceconnect';
    const isAuthMethod = method.attributes.authentication_method;

    return !isFC && isAuthMethod;
  }) ?? [];

  const authenticationVerificationMethodsExceptFC = authenticationMethodsExceptFC.filter((method) => {
    return method.attributes.verification_method;
  });

  const hasAlreadyHaveAnAccountSection =
    passwordLoginEnabled || authenticationMethodsExceptFC.length > 0;

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

      {hasAlreadyHaveAnAccountSection && (
        <>
          <Text mt="24px" mb="18px" fontWeight="bold" color="tenantText">
            {formatMessage(messages.alreadyHaveAnAccount)}
          </Text>
          {passwordLoginEnabled && (
            <>
              <EmailForm
                loading={loading}
                topText={sharedMessages.enterYourEmailAddress}
                setError={setError}
                onSubmit={onSubmit}
              />
              {authenticationMethodsExceptFC.length > 0 && (
                <Box mt="24px">
                  <Or />
                </Box>
              )}
            </>
          )}
          {authenticationMethodsExceptFC.map((provider) => (
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

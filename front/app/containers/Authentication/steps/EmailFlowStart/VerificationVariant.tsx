import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { SSOProvider } from 'api/authentication/singleSignOn';

import { SetError } from 'containers/Authentication/typings';
import useAuthConfig from 'containers/Authentication/useAuthConfig';

import Or from 'components/UI/Or';

import { useIntl } from 'utils/cl-intl';

import sharedMessages from '../messages';

import AdminSignInLink from './AdminSignInLink';
import EmailForm from './EmailForm';
import FranceConnectBlock from './FranceConnectBlock';
import messages from './messages';
import useAuthMethodNames from './SSOButtonsExceptFC/methodNames';
import useSSOProviders from './SSOButtonsExceptFC/providers';
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
  const { passwordLoginEnabled, ssoProviders } = useAuthConfig();
  const { verificationProviders, nonVerificationProviders } = useSSOProviders();
  const names = useAuthMethodNames();

  const franceConnectEnabled = !!ssoProviders.franceconnect;

  // Names of the verification-capable methods, used by the warning at the top.
  const verificationMethodNames = [
    ...(franceConnectEnabled ? [names.franceconnect] : []),
    ...verificationProviders.map((provider) => names[provider]),
  ].filter((name): name is string => !!name);

  const hasSignInThenVerifySection =
    passwordLoginEnabled || nonVerificationProviders.length > 0;

  return (
    <Box data-cy="email-flow-start">
      <VerificationWarning methodNames={verificationMethodNames} />

      {franceConnectEnabled && (
        <Box mb="18px">
          <FranceConnectBlock onClick={onSwitchToSSO} />
        </Box>
      )}
      {verificationProviders.map((provider) => (
        <SSOButton
          key={provider}
          provider={provider}
          onClickSSO={onSwitchToSSO}
        />
      ))}

      {hasSignInThenVerifySection && (
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
              {nonVerificationProviders.length > 0 && (
                <Box mt="24px">
                  <Or />
                </Box>
              )}
            </>
          )}
          {nonVerificationProviders.map((provider) => (
            <SSOButton
              key={provider}
              provider={provider}
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

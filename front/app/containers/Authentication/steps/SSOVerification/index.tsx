import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { SSOProvider } from 'api/authentication/singleSignOn';
import useVerificationMethodVerifiedActions from 'api/verification_methods/useVerificationMethodVerifiedActions';

import useFeatureFlag from 'hooks/useFeatureFlag';

import ClaveUnicaButton from 'components/UI/ClaveUnicaButton/ClaveUnicaButton';
import claveUnicaButtonMessages from 'components/UI/ClaveUnicaButton/messages';

import { FormattedMessage } from 'utils/cl-intl';

import NemlogInButton from '../_components/NemLogInButton';
import TextButton from '../_components/TextButton';
import AuthProviderButton from '../AuthProviders/AuthProviderButton';
import authProviderMessages from '../AuthProviders/messages';

import messages from './messages';

interface Props {
  onClickSSO: (ssoProvider: SSOProvider) => void;
  onClickLogin: () => void;
}

const SSOVerification = ({ onClickSSO, onClickLogin }: Props) => {
  const fakeSsoEnabled = useFeatureFlag({ name: 'fake_sso' });
  const { data: verificationMethod } = useVerificationMethodVerifiedActions();

  if (!verificationMethod) return null;

  const isNemLogIn = verificationMethod.data.attributes.name === 'nemlog_in';
  const isClaveUnica =
    verificationMethod.data.attributes.name === 'clave_unica';

  return (
    <Box>
      {isNemLogIn && (
        <NemlogInButton
          last={false}
          grayBorder
          standardSSOBehavior
          onClickStandardSSO={() => {
            onClickSSO('nemlog_in');
          }}
        />
      )}
      {isClaveUnica && (
        <ClaveUnicaButton
          disabled={false}
          message={
            <FormattedMessage {...claveUnicaButtonMessages.verifyClaveUnica} />
          }
          onClick={() => {
            onClickSSO('clave_unica');
          }}
        />
      )}
      {fakeSsoEnabled && (
        <AuthProviderButton
          icon="bullseye"
          flow="signup"
          showConsentOnFlow="signin"
          authProvider="fake_sso"
          id="e2e-verified-action-fake-sso-button"
          onContinue={onClickSSO}
        >
          <FormattedMessage {...authProviderMessages.continueWithFakeSSO} />
        </AuthProviderButton>
      )}
      <Text mt="20px" mb="0">
        <FormattedMessage
          {...messages.alreadyHaveAnAccount}
          values={{
            loginLink: (
              <TextButton onClick={onClickLogin}>
                <FormattedMessage {...messages.logIn} />
              </TextButton>
            ),
          }}
        />
      </Text>
    </Box>
  );
};

export default SSOVerification;

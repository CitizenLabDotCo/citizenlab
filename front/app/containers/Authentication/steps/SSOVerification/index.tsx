import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { SSOProvider } from 'api/authentication/singleSignOn';
import useVerificationMethodVerifiedActions from 'api/verification_methods/useVerificationMethodVerifiedActions';

import useFeatureFlag from 'hooks/useFeatureFlag';

import ClaveUnicaButton from 'components/UI/ClaveUnicaButton/ClaveUnicaButton';
import claveUnicaButtonMessages from 'components/UI/ClaveUnicaButton/messages';

import { FormattedMessage } from 'utils/cl-intl';

import MitIdButton from '../_components/MitIdButton';
import TextButton from '../_components/TextButton';
import AuthProviderButton from '../AuthProviders/AuthProviderButton';
import authProviderMessages from '../AuthProviders/messages';

import messages from './messages';
import IdAustriaButton from 'modules/commercial/id_id_austria/components/IdAustriaButton';

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
  const isCriipto = verificationMethod.data.attributes.name === 'criipto';
  const isIdAustria = verificationMethod.data.attributes.name === 'id_austria';

  return (
    <Box>
      {isNemLogIn && (
        <MitIdButton
          last={false}
          grayBorder
          standardSSOBehavior
          onClickStandardSSO={() => {
            onClickSSO('nemlog_in');
          }}
        />
      )}
      {isCriipto && (
        <MitIdButton
          last={false}
          grayBorder
          standardSSOBehavior
          onClickStandardSSO={() => {
            onClickSSO('criipto');
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
      {isIdAustria && (
        <IdAustriaButton
          last={false}
          grayBorder
          standardSSOBehavior
          onClickStandardSSO={() => {
            onClickSSO('id_austria');
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

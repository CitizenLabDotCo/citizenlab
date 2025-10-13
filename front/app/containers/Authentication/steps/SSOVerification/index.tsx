import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { SSOProvider } from 'api/authentication/singleSignOn';
import { TVerificationMethodName } from 'api/verification_methods/types';
import useVerificationMethodVerifiedActions from 'api/verification_methods/useVerificationMethodVerifiedActions';

import SSOVerificationButton from 'containers/Authentication/steps/_components/SSOVerificationButton';

import FranceConnectButton from 'components/UI/FranceConnectButton';
import franceConnectButtonMessages from 'components/UI/FranceConnectButton/messages';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import ClaveUnicaExpandedAuthProviderButton from '../_components/ClaveUnicaExpandedAuthProviderButton';
import TextButton from '../_components/TextButton';

import messages from './messages';

interface Props {
  onClickSSO: (ssoProvider: SSOProvider) => void;
  onClickLogin: () => void;
}

const SSOVerification = ({ onClickSSO, onClickLogin }: Props) => {
  const { data: verificationMethod } = useVerificationMethodVerifiedActions();
  const { formatMessage } = useIntl();

  if (!verificationMethod) return null;

  const methodName = verificationMethod.data.attributes.name;

  const methodButton = (methodName: TVerificationMethodName) => {
    if (methodName === 'clave_unica') {
      return (
        <ClaveUnicaExpandedAuthProviderButton
          showConsent
          onSelectAuthProvider={onClickSSO}
        />
      );
    } else if (methodName === 'franceconnect') {
      return (
        <FranceConnectButton
          onClick={() => {
            onClickSSO('franceconnect');
          }}
          logoAlt={formatMessage(
            franceConnectButtonMessages.franceConnectVerificationButtonAltText
          )}
        />
      );
    } else {
      return (
        <SSOVerificationButton
          verificationMethodName={methodName}
          last={false}
          grayBorder
          standardSSOBehavior
          onClickStandardSSO={() => {
            onClickSSO(methodName as SSOProvider);
          }}
        />
      );
    }
  };

  return (
    <Box>
      {methodButton(methodName)}
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

import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { SSOProvider } from 'api/authentication/singleSignOn';
import useVerificationMethodVerifiedActions from 'api/verification_methods/useVerificationMethodVerifiedActions';

import SSOVerificationButton from 'containers/Authentication/steps/_components/SSOVerificationButton';

import ClaveUnicaButton from 'components/UI/ClaveUnicaButton/ClaveUnicaButton';
import claveUnicaButtonMessages from 'components/UI/ClaveUnicaButton/messages';

import { FormattedMessage } from 'utils/cl-intl';

import TextButton from '../_components/TextButton';

import messages from './messages';

interface Props {
  onClickSSO: (ssoProvider: SSOProvider) => void;
  onClickLogin: () => void;
}

const SSOVerification = ({ onClickSSO, onClickLogin }: Props) => {
  const { data: verificationMethod } = useVerificationMethodVerifiedActions();

  if (!verificationMethod) return null;

  const methodName = verificationMethod.data.attributes.name;

  return (
    <Box>
      {methodName === 'clave_unica' ? (
        <ClaveUnicaButton
          disabled={false}
          message={
            <FormattedMessage {...claveUnicaButtonMessages.verifyClaveUnica} />
          }
          onClick={() => {
            onClickSSO('clave_unica');
          }}
        />
      ) : (
        <SSOVerificationButton
          verificationMethodName={methodName}
          last={false}
          grayBorder
          standardSSOBehavior
          onClickStandardSSO={() => {
            onClickSSO(methodName as SSOProvider);
          }}
        />
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

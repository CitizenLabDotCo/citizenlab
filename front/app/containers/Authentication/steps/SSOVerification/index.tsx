import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { FormattedMessage } from 'utils/cl-intl';

import TextButton from '../_components/TextButton';
import AuthProviderButton from '../AuthProviders/AuthProviderButton';
import authProviderMessages from '../AuthProviders/messages';

import messages from './messages';

interface Props {
  onClickSSO: () => void;
  onClickLogin: () => void;
}

const SSOVerification = ({ onClickSSO, onClickLogin }: Props) => {
  const fakeSsoEnabled = useFeatureFlag({ name: 'fake_sso' });

  return (
    <Box>
      {fakeSsoEnabled && (
        <AuthProviderButton
          icon="bullseye"
          flow="signup"
          authProvider="fake_sso"
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

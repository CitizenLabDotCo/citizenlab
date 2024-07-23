import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import TextButton from '../_components/TextButton';
import SSOButton from '../LightFlowStart/SSOButtons/SSOButton';

import messages from './messages';

interface Props {
  onClickSSO: () => void;
  onClickLogin: () => void;
}

const SSOVerification = ({ onClickSSO, onClickLogin }: Props) => {
  return (
    <Box>
      <SSOButton
        ssoProvider="azureactivedirectory"
        marginTop="0px"
        onClickSSO={onClickSSO}
      />
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

import React from 'react';

import { Box, Text, Button } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  onLink: () => void;
  onKeepAnonymous: () => void;
}

const ClaimTokenConsent = ({ onLink, onKeepAnonymous }: Props) => {
  return (
    <Box>
      <Text mt="0px">
        <FormattedMessage {...messages.youRecentlyParticipatedWhileLoggedOut} />
      </Text>
      <Box display="flex" mt="32px">
        <Button width="auto" onClick={onLink} mr="12px">
          <FormattedMessage {...messages.linkParticipations} />
        </Button>
        <Button width="auto" buttonStyle="secondary" onClick={onKeepAnonymous}>
          <FormattedMessage {...messages.keepAnonymous} />
        </Button>
      </Box>
    </Box>
  );
};

export default ClaimTokenConsent;

import React from 'react';

import {
  Box,
  Text,
  Icon,
  colors,
  Button,
} from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  onLink: () => void;
  onKeepAnonymous: () => void;
}

const ClaimTokenConsent = ({ onLink, onKeepAnonymous }: Props) => {
  return (
    <Box>
      <Text mt="0px" mb="32px">
        <Icon
          width="20px"
          height="20px"
          name="personRaisedHand"
          fill={colors.textSecondary}
          mr="8px"
          transform="translate(0,-1)"
        />
        <FormattedMessage {...messages.linkYourContributions} />
      </Text>
      <Text fontSize="s">
        <FormattedMessage {...messages.youRecentlyParticipatedWhileLoggedOut} />
      </Text>
      <Box>
        <Button width="auto" onClick={onLink}>
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

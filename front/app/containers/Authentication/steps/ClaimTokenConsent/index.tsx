import React from 'react';

import { Box, Text, Button } from '@citizenlab/cl2-component-library';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

import messages from './messages';

const INPUT_TYPE_TO_MESSAGE: Record<Props['inputType'], MessageDescriptor> = {
  idea: messages.linkContributionTextIdeation,
  proposal: messages.linkContributionTextProposal,
  survey: messages.linkContributionTextSurvey,
};

interface Props {
  inputType: 'idea' | 'proposal' | 'survey';
  onLink: () => void;
  onKeepAnonymous: () => void;
}

const ClaimTokenConsent = ({ inputType, onLink, onKeepAnonymous }: Props) => {
  return (
    <Box>
      <Text mt="0px">
        <FormattedMessage {...INPUT_TYPE_TO_MESSAGE[inputType]} />
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

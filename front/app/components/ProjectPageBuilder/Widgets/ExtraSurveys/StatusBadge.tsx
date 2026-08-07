import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

import { ExtraSurveyState } from './utils';

const BADGES: {
  [key in ExtraSurveyState]: {
    message: MessageDescriptor;
    background: string;
    color: 'green700' | 'coolGrey700';
  };
} = {
  open: {
    message: messages.extraSurveysBadgeOpen,
    background: colors.successLight,
    color: 'green700',
  },
  upcoming: {
    message: messages.extraSurveysBadgeUpcoming,
    background: colors.grey200,
    color: 'coolGrey700',
  },
  closed: {
    message: messages.extraSurveysBadgeClosed,
    background: colors.grey200,
    color: 'coolGrey700',
  },
  taken: {
    message: messages.extraSurveysBadgeCompleted,
    background: colors.successLight,
    color: 'green700',
  },
  notEligible: {
    message: messages.extraSurveysBadgeRestricted,
    background: colors.grey200,
    color: 'coolGrey700',
  },
};

const StatusBadge = ({ state }: { state: ExtraSurveyState }) => {
  const badge = BADGES[state];

  return (
    <Box
      display="inline-block"
      px="8px"
      py="2px"
      bgColor={badge.background}
      borderRadius="3px"
      style={{ textTransform: 'uppercase' }}
    >
      <Text m="0px" fontSize="xs" fontWeight="bold" color={badge.color}>
        <FormattedMessage {...badge.message} />
      </Text>
    </Box>
  );
};

export default StatusBadge;

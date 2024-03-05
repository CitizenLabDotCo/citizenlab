import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';
import ParticipationOpenIcon from '../ParticipationOpenIcon';
import ParticipationSuccessIcon from '../ParticipationSuccessIcon';

import TimeLeft from './TimeLeft';

interface Props {
  currentPhase: IPhaseData | undefined;
  hasUserParticipated: boolean;
}

const TimeIndicator = ({ currentPhase, hasUserParticipated }: Props) => {
  return hasUserParticipated ? (
    <Box display="flex" alignItems="center">
      <Box mr="4px" pb="2px">
        <ParticipationSuccessIcon />
      </Box>
      <Text color="white" m="0px" fontSize="s">
        <FormattedMessage {...messages.userHasParticipated} />
      </Text>
    </Box>
  ) : (
    <Box display="flex" alignItems="center">
      <Box mr="4px" pb="2px">
        <ParticipationOpenIcon />
      </Box>
      {currentPhase && currentPhase.attributes.end_at !== null ? (
        <TimeLeft currentPhaseEndsAt={currentPhase.attributes.end_at} />
      ) : (
        <Text color="white" m="0px" fontSize="s">
          <FormattedMessage {...messages.mobileProjectOpenForSubmission} />
        </Text>
      )}
    </Box>
  );
};

export default TimeIndicator;

import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';

import PhaseTimeLeft from 'components/PhaseTimeLeft';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';
import ParticipationOpenIcon from '../ParticipationOpenIcon';
import ParticipationSuccessIcon from '../ParticipationSuccessIcon';

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
        <Text
          color="white"
          style={{ textTransform: 'uppercase' }}
          fontSize="xs"
          fontWeight="bold"
          m="0"
        >
          <PhaseTimeLeft currentPhaseEndsAt={currentPhase.attributes.end_at} />
        </Text>
      ) : (
        <Text color="white" m="0px" fontSize="s">
          <FormattedMessage {...messages.mobileProjectOpenForSubmission} />
        </Text>
      )}
    </Box>
  );
};

export default TimeIndicator;

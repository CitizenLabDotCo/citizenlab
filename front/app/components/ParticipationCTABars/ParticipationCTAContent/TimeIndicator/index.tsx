import React from 'react';
import { Box, Text } from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import ParticipationOpenIcon from '../ParticipationOpenIcon';
import SuccessIcon from '../SuccessIcon';
import TimeLeft from './TimeLeft';
import messages from '../../messages';
import { IPhaseData } from 'api/phases/types';

interface Props {
  currentPhase: IPhaseData | undefined;
  hasUserParticipated: boolean;
}

const TimeIndicator = ({ currentPhase, hasUserParticipated }: Props) => {
  return hasUserParticipated ? (
    <Box display="flex" alignItems="center">
      <Box mr="4px" pb="2px">
        <ParticipationOpenIcon />
      </Box>
      <Text color="white" m="0px" fontSize="s">
        <FormattedMessage {...messages.userHasParticipated} />
      </Text>
    </Box>
  ) : (
    <Box display="flex" alignItems="center">
      <Box mr="4px" pb="2px">
        <SuccessIcon />
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

import React from 'react';
import { Box, Text } from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import BlinkingDot from '../BlinkingDot';
import TimeLeft from './TimeLeft';
import messages from '../../messages';
import { IPhaseData } from 'api/phases/types';

interface Props {
  currentPhase: IPhaseData | undefined;
  hasUserParticipated: boolean;
}

const TimeIndicator = ({ currentPhase, hasUserParticipated }: Props) => {
  return (
    <Box display="flex" alignItems="center">
      <BlinkingDot hasUserParticipated={hasUserParticipated} />
      {/* A phase that has an end date */}
      {currentPhase && currentPhase.attributes.end_at !== null ? (
        <TimeLeft currentPhaseEndsAt={currentPhase.attributes.end_at} />
      ) : (
        <Text color="white" m="0px" fontSize="s">
          <FormattedMessage
            {...(hasUserParticipated
              ? messages.userHasParticipated
              : messages.mobileProjectOpenForSubmission)}
          />
        </Text>
      )}
    </Box>
  );
};

export default TimeIndicator;

import React from 'react';
import { Box, Text, useBreakpoint } from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import BlinkingDot from '../BlinkingDot';
import TimeLeft from './TimeLeft';
import messages from '../../messages';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';
import useLocale from 'hooks/useLocale';
import { hidePhases } from 'api/phases/utils';

interface Props {
  currentPhase: IPhaseData | undefined;
  project: IProjectData;
  hasUserParticipated: boolean;
  phases: IPhaseData[] | undefined;
}

const TimeIndicator = ({
  currentPhase,
  hasUserParticipated,
  phases,
}: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');
  const locale = useLocale();
  const treatAsContinuous = hidePhases(phases, locale);
  const showTimeLeft = currentPhase && !treatAsContinuous ? true : false;

  const getUserParticipationMessage = () => {
    if (hasUserParticipated) {
      return messages.userHasParticipated;
    }
    if (isSmallerThanPhone && !hasUserParticipated) {
      return messages.mobileProjectOpenForSubmission;
    }
    return messages.projectOpenForSubmission;
  };

  return (
    <Box display="flex" alignItems="center">
      <BlinkingDot hasUserParticipated={hasUserParticipated} />
      {showTimeLeft ? (
        <Box>
          <TimeLeft currentPhase={currentPhase} />
        </Box>
      ) : (
        <Text color="white" m="0px" fontSize="s">
          <FormattedMessage {...getUserParticipationMessage()} />
        </Text>
      )}
    </Box>
  );
};

export default TimeIndicator;

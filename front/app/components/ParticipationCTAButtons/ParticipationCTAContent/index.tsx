import React, { useEffect, useState } from 'react';

// Components
import { Box, Text, Icon, colors } from '@citizenlab/cl2-component-library';
import IdeaButton from 'components/IdeaButton';

// hooks
import { useTheme } from 'styled-components';

// services
import { IPhaseData, getCurrentPhase, getLastPhase } from 'services/phases';
import { IProjectData } from 'services/projects';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { pastPresentOrFuture } from 'utils/dateUtils';
import { getPeriodRemainingUntil } from 'utils/dateUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

type Props = {
  project: IProjectData;
  phases: Error | IPhaseData[] | null | undefined;
  timeLeft?: string;
  hasUserParticipated?: boolean;
  CTAButton?: React.ReactNode;
};

export const ParticipationCTAContent = ({
  phases,
  project,
  CTAButton,
  hasUserParticipated = false,
}: Props) => {
  const theme = useTheme();
  const currentPhase = getCurrentPhase(phases);
  const timeLeft = currentPhase
    ? getPeriodRemainingUntil(currentPhase.attributes.end_at, 'weeks')
    : '';
  const message = hasUserParticipated
    ? messages.userHasParticipated
    : messages.projectOpenForSubmission;

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-around"
      flexDirection="row"
      width="100%"
      bgColor={theme.colors.tenantPrimary}
      height="62px"
    >
      <Box display="flex" justifyContent="center" alignItems="center">
        <Icon
          name={hasUserParticipated ? 'check-circle' : 'dot'}
          width="12px"
          height="12px"
          fill={colors.white}
          mr="6px"
        />
        <Text color="white">
          <FormattedMessage {...message} />
        </Text>
      </Box>
      <Box display="flex" alignItems="center">
        {timeLeft && (
          <Text color="white" style={{ textTransform: 'uppercase' }} mr="12px">
            <FormattedMessage
              {...messages.participationTimeLeft}
              values={{
                timeLeft: timeLeft,
              }}
            />
          </Text>
        )}
        {CTAButton}
      </Box>
    </Box>
  );
};

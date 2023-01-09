import React from 'react';

// Components
import { Box, Text, Icon, colors } from '@citizenlab/cl2-component-library';

// hooks
import { useTheme } from 'styled-components';

// services
import { IPhaseData } from 'services/phases';

// utils
import { getPeriodRemainingUntil } from 'utils/dateUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

type Props = {
  timeLeft?: string;
  hasUserParticipated?: boolean;
  CTAButton?: React.ReactNode;
  currentPhase: IPhaseData | null;
};

export const ParticipationCTAContent = ({
  currentPhase,
  CTAButton,
  hasUserParticipated = false,
}: Props) => {
  const theme = useTheme();
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
          width="16px"
          height="16px"
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

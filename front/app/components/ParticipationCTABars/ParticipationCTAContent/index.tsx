import React from 'react';

// Components
import {
  Box,
  Text,
  Icon,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

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
  const isSmallerThanXlPhone = useBreakpoint('phone');
  const timeLeft = currentPhase
    ? getPeriodRemainingUntil(currentPhase.attributes.end_at, 'weeks')
    : '';
  let message = hasUserParticipated
    ? messages.userHasParticipated
    : messages.projectOpenForSubmission;

  if (isSmallerThanXlPhone && !hasUserParticipated) {
    message = messages.mobileProjectOpenForSubmission;
  }

  if (isSmallerThanXlPhone) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-around"
        flexDirection="row"
        width="100%"
        bgColor={theme.colors.tenantPrimary}
        height="62px"
        p="20px"
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <Text color="white" m="0px" fontWeight="bold" fontSize="s">
            <FormattedMessage {...message} />
          </Text>
          {timeLeft && (
            <Text
              color="white"
              style={{ textTransform: 'uppercase' }}
              m="0px"
              width="100%"
              fontSize="xs"
            >
              <FormattedMessage
                {...messages.participationTimeLeft}
                values={{
                  timeLeft: timeLeft,
                }}
              />
            </Text>
          )}
        </Box>
        <Box display="flex" alignItems="center">
          {CTAButton}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-around"
      flexDirection="row"
      width="100%"
      bgColor={theme.colors.tenantPrimary}
      height="62px"
      p="20px"
    >
      <Box display="flex" justifyContent="center" alignItems="center">
        <Icon
          name={hasUserParticipated ? 'check-circle' : 'dot'}
          width="16px"
          height="16px"
          fill={colors.white}
          mr="6px"
        />
        <Text color="white" fontWeight="bold" fontSize="s">
          <FormattedMessage {...message} />
        </Text>
      </Box>
      <Box display="flex" alignItems="center">
        {timeLeft && (
          <Text
            color="white"
            style={{ textTransform: 'uppercase' }}
            mr="12px"
            fontSize="xs"
          >
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

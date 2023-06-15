import React from 'react';

// Components
import {
  Box,
  Text,
  Icon,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

// services
import { IPhaseData } from 'api/phases/types';

// utils
import { getPeriodRemainingUntil } from 'utils/dateUtils';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';

// styling
import styled, { useTheme } from 'styled-components';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

const BlickingIcon = styled(Icon)<{ showAnimation: boolean }>`
  animation-name: blink-animation;
  animation-duration: ${({ showAnimation }) => (showAnimation ? '1.8s' : '0s')};
  animation-delay: 1s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;

  @keyframes blink-animation {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

type Props = {
  timeLeft?: string;
  hasUserParticipated?: boolean;
  CTAButton?: React.ReactNode;
  currentPhase: IPhaseData | undefined;
  hideDefaultParticipationMessage?: boolean;
  participationState?: JSX.Element; // Optional element which displays on bottom left
  timeLeftPosition?: 'left' | 'right';
};

export const ParticipationCTAContent = ({
  currentPhase,
  CTAButton,
  hasUserParticipated = false,
  hideDefaultParticipationMessage = false,
  participationState,
  timeLeftPosition = 'right',
}: Props) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const isSmallerThanPhone = useBreakpoint('phone');
  let timeLeft = currentPhase
    ? getPeriodRemainingUntil(currentPhase.attributes.end_at, 'weeks')
    : undefined;
  let timeLeftMessage = messages.xWeeksLeft;

  if (timeLeft !== undefined && timeLeft < 2 && currentPhase) {
    timeLeft = getPeriodRemainingUntil(currentPhase.attributes.end_at, 'days');
    timeLeftMessage = messages.xDayLeft;
  }

  let userParticipationMessage = hasUserParticipated
    ? messages.userHasParticipated
    : messages.projectOpenForSubmission;

  if (isSmallerThanPhone && !hasUserParticipated) {
    userParticipationMessage = messages.mobileProjectOpenForSubmission;
  }

  const timeLeftTranslated = timeLeft
    ? formatMessage(timeLeftMessage, { timeLeft })
    : null;

  if (isSmallerThanPhone) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexDirection="row"
        width="100%"
        bgColor={theme.colors.tenantPrimary}
        px="20px"
        py="8px"
      >
        <Box
          display="flex"
          flexWrap="wrap"
          flexDirection="row"
          alignItems="center"
        >
          <Box>
            <BlickingIcon
              name={hasUserParticipated ? 'check-circle' : 'dot'}
              width="16px"
              height="16px"
              fill={colors.white}
              mr="8px"
              showAnimation={!hasUserParticipated}
            />
          </Box>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
          >
            <Text color="white" m="0px" fontSize="s">
              <div
                style={{
                  ...(isSmallerThanPhone ? { fontWeight: '600' } : {}),
                }}
              >
                {!hideDefaultParticipationMessage && (
                  <FormattedMessage {...userParticipationMessage} />
                )}
                {hideDefaultParticipationMessage &&
                  timeLeftPosition === 'left' &&
                  timeLeftTranslated?.toUpperCase()}
              </div>
            </Text>
            {timeLeft !== undefined && timeLeftPosition === 'right' && (
              <Text
                color="white"
                style={{ textTransform: 'uppercase' }}
                m="0px"
                width="100%"
                fontSize="xs"
                my="0px"
              >
                <FormattedMessage
                  {...timeLeftMessage}
                  values={{
                    timeLeft,
                  }}
                />
              </Text>
            )}
          </Box>
          <Box display="flex" alignItems="center" width="100%">
            {participationState && participationState}
          </Box>
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
      height="64px"
      p="20px"
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexDirection="row"
        width="100%"
        maxWidth={`${maxPageWidth}px`}
      >
        <Box display="flex" flexWrap="wrap" alignItems="center">
          <BlickingIcon
            name={hasUserParticipated ? 'check-circle' : 'dot'}
            width="16px"
            height="16px"
            fill={colors.white}
            mr="8px"
            showAnimation={!hasUserParticipated}
          />
          <Text color="white" fontSize="s" my="0px">
            {!hideDefaultParticipationMessage && (
              <FormattedMessage {...userParticipationMessage} />
            )}{' '}
            {timeLeftPosition === 'left' && timeLeftTranslated?.toUpperCase()}{' '}
          </Text>
          <Box display="flex" width="100%">
            {participationState && participationState}
          </Box>
        </Box>
        <Box display="flex" alignItems="center">
          {timeLeft !== undefined && timeLeftPosition === 'right' && (
            <Text
              color="white"
              style={{ textTransform: 'uppercase' }}
              mr="24px"
              my="0px"
              fontSize="xs"
              fontWeight="bold"
            >
              <FormattedMessage
                {...timeLeftMessage}
                values={{
                  timeLeft,
                }}
              />
            </Text>
          )}
          {CTAButton}
        </Box>
      </Box>
    </Box>
  );
};

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
import { getMethodConfig } from 'utils/participationMethodUtils';

// types
import { IProjectData } from 'api/projects/types';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
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
  project: IProjectData;
};

export const ParticipationCTAContent = ({
  currentPhase,
  CTAButton,
  hasUserParticipated = false,
  project,
}: Props) => {
  const theme = useTheme();
  const isSmallerThanPhone = useBreakpoint('phone');
  const config = getMethodConfig(
    currentPhase?.attributes.participation_method ||
      project.attributes.participation_method
  );
  const useProjectClosedStyle =
    config?.useProjectClosedCTABarStyle &&
    config.useProjectClosedCTABarStyle(currentPhase || project);

  let timeLeft = currentPhase
    ? getPeriodRemainingUntil(currentPhase.attributes.end_at, 'weeks')
    : undefined;
  let timeLeftMessage = messages.xWeeksLeft;

  if (timeLeft !== undefined && timeLeft < 2 && currentPhase) {
    timeLeft = getPeriodRemainingUntil(currentPhase.attributes.end_at, 'days');
    timeLeftMessage = messages.xDayLeft;
  }

  const getUserParticipationMessage = () => {
    if (useProjectClosedStyle) {
      return messages.projectClosedForSubmission;
    }
    if (hasUserParticipated) {
      return messages.userHasParticipated;
    }
    if (isSmallerThanPhone && !hasUserParticipated) {
      return messages.mobileProjectOpenForSubmission;
    }
    return messages.projectOpenForSubmission;
  };

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
        <Box display="flex" flexDirection="row" alignItems="center">
          <Box>
            {!useProjectClosedStyle && (
              <BlickingIcon
                name={hasUserParticipated ? 'check-circle' : 'dot'}
                width="16px"
                height="16px"
                fill={colors.white}
                mr="8px"
                showAnimation={!hasUserParticipated}
              />
            )}
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
                <FormattedMessage {...getUserParticipationMessage()} />
              </div>
            </Text>
            {timeLeft !== undefined && (
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
        <Box display="flex" justifyContent="center" alignItems="center">
          {!useProjectClosedStyle && (
            <BlickingIcon
              name={hasUserParticipated ? 'check-circle' : 'dot'}
              width="16px"
              height="16px"
              fill={colors.white}
              mr="8px"
              showAnimation={!hasUserParticipated}
            />
          )}
          <Text color="white" fontSize="s" my="0px">
            <FormattedMessage {...getUserParticipationMessage()} />
          </Text>
        </Box>
        <Box display="flex" alignItems="center">
          {timeLeft !== undefined && (
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

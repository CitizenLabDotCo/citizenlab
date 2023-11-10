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
import { getMethodConfig } from 'utils/configs/participationMethodConfig';

// types
import { IProjectData } from 'api/projects/types';

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
  project: IProjectData;
};

const ParticipationCTAContent = ({
  currentPhase,
  CTAButton,
  hasUserParticipated = false,
  hideDefaultParticipationMessage = false,
  participationState,
  project,
}: Props) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();
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
        flexDirection="column"
        bgColor={theme.colors.tenantPrimary}
        p="20px"
      >
        <Box display="flex" alignItems="center" mb="20px">
          <Box display="flex" alignItems="center">
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
            <Text color="white" m="0px" fontSize="s">
              <span
                style={{
                  ...(isSmallerThanPhone ? { fontWeight: '600' } : {}),
                }}
              >
                {!hideDefaultParticipationMessage && (
                  <FormattedMessage {...getUserParticipationMessage()} />
                )}
                {hideDefaultParticipationMessage && timeLeft !== undefined && (
                  <Text
                    color="white"
                    style={{ textTransform: 'uppercase' }}
                    fontSize="xs"
                    m="0px"
                    ml="auto"
                  >
                    {formatMessage(timeLeftMessage, { timeLeft })}
                  </Text>
                )}
              </span>
            </Text>
          </Box>
          {participationState && (
            <Box display="flex" alignItems="center" ml="auto">
              {participationState}
            </Box>
          )}
        </Box>
        <Box display="flex">{CTAButton}</Box>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-around"
      width="100%"
      bgColor={theme.colors.tenantPrimary}
      height="64px"
      p="20px"
    >
      <Box display="flex" width="100%" maxWidth={`${maxPageWidth}px`}>
        <Box display="flex" alignItems="center">
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
            {!hideDefaultParticipationMessage && (
              <FormattedMessage {...getUserParticipationMessage()} />
            )}
          </Text>
          {timeLeft !== undefined && (
            <Text
              color="white"
              style={{ textTransform: 'uppercase' }}
              mr="24px"
              my="0px"
              fontSize="xs"
              fontWeight="bold"
            >
              {formatMessage(timeLeftMessage, { timeLeft })}
            </Text>
          )}
        </Box>
        <Box display="flex" ml="auto">
          {participationState}
          {CTAButton}
        </Box>
      </Box>
    </Box>
  );
};

export default ParticipationCTAContent;

import React from 'react';

// Components
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

// services
import { IPhaseData } from 'api/phases/types';

// styling
import { useTheme } from 'styled-components';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';
import TimeIndicator from './TimeIndicator';

type Props = {
  hasUserParticipated?: boolean;
  CTAButton: React.ReactNode;
  currentPhase: IPhaseData | undefined;
  participationState?: JSX.Element;
};

const ParticipationCTAContent = ({
  currentPhase,
  CTAButton,
  hasUserParticipated = false,
  participationState,
}: Props) => {
  const theme = useTheme();

  const isSmallerThanPhone = useBreakpoint('phone');

  if (isSmallerThanPhone) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        bgColor={theme.colors.tenantPrimary}
        p={isSmallerThanPhone ? '12px' : '20px'}
      >
        <Box
          display="flex"
          alignItems="center"
          mb={isSmallerThanPhone ? '12px' : '16px'}
        >
          <Box display="flex" alignItems="center">
            <TimeIndicator
              hasUserParticipated={hasUserParticipated}
              currentPhase={currentPhase}
            />
          </Box>
          <Box ml="auto">{participationState}</Box>
        </Box>
        {CTAButton}
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
          <TimeIndicator
            hasUserParticipated={hasUserParticipated}
            currentPhase={currentPhase}
          />
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

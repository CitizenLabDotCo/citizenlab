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
  CTAButton?: React.ReactNode;
  currentPhase: IPhaseData | undefined;
  participationState?: React.ReactNode;
};

const ParticipationCTAContent = ({
  currentPhase,
  CTAButton,
  hasUserParticipated = false,
  participationState,
}: Props) => {
  const theme = useTheme();
  const isSmallerThanPhone = useBreakpoint('phone');

  return isSmallerThanPhone ? (
    <Box
      display="flex"
      flexDirection="column"
      bgColor={theme.colors.tenantPrimary}
      p="12px"
    >
      <Box
        display="flex"
        alignItems="center"
        mb={CTAButton !== undefined ? '12px' : '0'}
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
  ) : (
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

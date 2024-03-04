import React from 'react';

// Components
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';
import { useTheme } from 'styled-components';

import { IPhaseData } from 'api/phases/types';

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
        <TimeIndicator
          hasUserParticipated={hasUserParticipated}
          currentPhase={currentPhase}
        />
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
        <TimeIndicator
          hasUserParticipated={hasUserParticipated}
          currentPhase={currentPhase}
        />
        <Box display="flex" alignItems="center" ml="auto">
          {participationState}
          <Box ml={CTAButton !== undefined ? '12px' : '0'}>{CTAButton}</Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ParticipationCTAContent;

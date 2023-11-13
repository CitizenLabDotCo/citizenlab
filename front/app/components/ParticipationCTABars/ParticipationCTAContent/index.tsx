import React from 'react';

// Components
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

// services
import { IPhaseData } from 'api/phases/types';

// types
import { IProjectData } from 'api/projects/types';

// styling
import { useTheme } from 'styled-components';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';
import TimeIndicator from './TimeIndicator';

type Props = {
  hasUserParticipated?: boolean;
  CTAButton: React.ReactNode;
  currentPhase: IPhaseData | undefined;
  participationState?: JSX.Element;
  project: IProjectData;
  phases: IPhaseData[] | undefined;
};

const ParticipationCTAContent = ({
  currentPhase,
  CTAButton,
  hasUserParticipated = false,
  participationState,
  project,
  phases,
}: Props) => {
  const theme = useTheme();

  const isSmallerThanPhone = useBreakpoint('phone');

  if (isSmallerThanPhone) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        bgColor={theme.colors.tenantPrimary}
        p="20px"
      >
        <Box display="flex" alignItems="center" mb="16px">
          <Box display="flex" alignItems="center">
            <TimeIndicator
              hasUserParticipated={hasUserParticipated}
              currentPhase={currentPhase}
              project={project}
              phases={phases}
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
            project={project}
            phases={phases}
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

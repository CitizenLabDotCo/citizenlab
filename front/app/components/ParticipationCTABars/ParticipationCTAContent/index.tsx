import React from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { IPhaseData } from 'api/phases/types';

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
  // This is the same condition we have in ProjectCTABar.
  const sticksToBottom = isSmallerThanPhone;

  return sticksToBottom ? (
    <Box
      display="flex"
      flexDirection="column"
      bgColor={theme.colors.tenantPrimary}
      p="12px"
    >
      <Box alignItems="center" mb={CTAButton !== undefined ? '12px' : '0'}>
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
      /* 
        This is is needed to determine how much to push down the input filters
        (in ContentRight).

        Putting this id in ProjectCTABar does not work at the moment, because
        the rendered bar (BarContents) can sometimes be null. In that case,
        we are telling ContentRight that the top bar is visible, while it is not.
        
        We can look into moving this component to ProjectCTABar (where we split between top and bottom bar)
        instead of here. Then only define the CTAButton part in the config, then we can probably
        move the id in ProjectCTABar.
      */
      id="project-cta-bar-top"
      data-cy="project-cta-bar-top"
    >
      <Box display="flex" width="100%" maxWidth={`${maxPageWidth}px`}>
        <Box>
          <TimeIndicator
            hasUserParticipated={hasUserParticipated}
            currentPhase={currentPhase}
          />
          <Box>{participationState}</Box>
        </Box>

        <Box display="flex" alignItems="center" ml="auto">
          <Box ml={CTAButton !== undefined ? '12px' : '0'}>{CTAButton}</Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ParticipationCTAContent;

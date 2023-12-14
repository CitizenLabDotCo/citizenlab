import React, { useEffect, useState } from 'react';

// Components
import IdeaButton from 'components/IdeaButton';
import ParticipationCTAContent from 'components/ParticipationCTABars/ParticipationCTAContent';
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

// hooks
import { useTheme } from 'styled-components';
import useAuthUser from 'api/me/useAuthUser';

// services
import { getCurrentPhase, getLastPhase } from 'api/phases/utils';
import { IPhaseData } from 'api/phases/types';
import { getIdeaPostingRules } from 'utils/actionTakingRules';

// utils
import {
  CTABarProps,
  hasProjectEndedOrIsArchived,
} from 'components/ParticipationCTABars/utils';
import usePhases from 'api/phases/usePhases';

const NativeSurveyCTABar = ({ project }: CTABarProps) => {
  const theme = useTheme();
  const { data: authUser } = useAuthUser();
  const { data: phases } = usePhases(project.id);
  const isSmallerThanPhone = useBreakpoint('phone');
  const [currentPhase, setCurrentPhase] = useState<IPhaseData | undefined>();

  useEffect(() => {
    setCurrentPhase(
      getCurrentPhase(phases?.data) || getLastPhase(phases?.data)
    );
  }, [phases, project]);

  const { disabledReason } = getIdeaPostingRules({
    project,
    phase: currentPhase,
    authUser: authUser?.data,
  });
  const hasUserParticipated = disabledReason === 'postingLimitedMaxReached';

  if (hasProjectEndedOrIsArchived(project, currentPhase)) {
    return null;
  }

  return (
    <ParticipationCTAContent
      currentPhase={currentPhase}
      CTAButton={
        hasUserParticipated ? null : (
          <Box w="100%">
            <IdeaButton
              id="project-survey-button"
              data-testid="e2e-project-survey-button"
              projectId={project.id}
              fontWeight="500"
              bgColor={theme.colors.white}
              textColor={theme.colors.tenantText}
              iconPos="right"
              icon={!isSmallerThanPhone ? 'arrow-right' : undefined}
              iconColor={theme.colors.tenantText}
              textHoverColor={theme.colors.black}
              iconHoverColor={theme.colors.black}
              phase={currentPhase}
              iconSize="20px"
              padding="6px 12px"
              fontSize="14px"
              participationMethod="native_survey"
            />
          </Box>
        )
      }
      hasUserParticipated={hasUserParticipated}
    />
  );
};

export default NativeSurveyCTABar;

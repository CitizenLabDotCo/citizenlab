import React, { useEffect, useState } from 'react';

// Components
import IdeaButton from 'components/IdeaButton';
import { ParticipationCTAContent } from 'components/ParticipationCTABars/ParticipationCTAContent';
import { useBreakpoint } from '@citizenlab/cl2-component-library';

// hooks
import { useTheme } from 'styled-components';
import useAuthUser from 'hooks/useAuthUser';

// services
import { IPhaseData, getCurrentPhase, getLastPhase } from 'services/phases';
import { getIdeaPostingRules } from 'services/actionTakingRules';

// utils
import { isNilOrError } from 'utils/helperUtils';
import {
  CTABarProps,
  hasRrojectEndedOrIsArchived,
} from 'components/ParticipationCTABars/utils';

export const NativeSurveyCTABar = ({ phases, project }: CTABarProps) => {
  const theme = useTheme();
  const authUser = useAuthUser();
  const isSmallerThanXlPhone = useBreakpoint('phone');
  const [currentPhase, setCurrentPhase] = useState<IPhaseData | null>(null);

  useEffect(() => {
    setCurrentPhase(getCurrentPhase(phases) || getLastPhase(phases));
  }, [phases]);

  const isPhaseNativeSurvey =
    currentPhase?.attributes.participation_method === 'native_survey';
  const { disabledReason } = getIdeaPostingRules({
    project,
    phase: !isNilOrError(currentPhase) ? currentPhase : null,
    authUser,
  });
  const hasUserParticipated = disabledReason === 'postingLimitedMaxReached';

  if (hasRrojectEndedOrIsArchived(project, currentPhase)) {
    return null;
  }

  const CTAButton = hasUserParticipated ? null : (
    <IdeaButton
      id="project-survey-button"
      data-testid="e2e-project-survey-button"
      projectId={project.id}
      participationContextType={isPhaseNativeSurvey ? 'phase' : 'project'}
      phaseId={isPhaseNativeSurvey ? currentPhase.id : ''}
      fontWeight="500"
      bgColor={theme.colors.white}
      textColor={theme.colors.tenantText}
      iconPos="right"
      icon={!isSmallerThanXlPhone ? 'arrow-right' : undefined}
      iconColor={theme.colors.tenantText}
      textHoverColor={theme.colors.black}
      iconHoverColor={theme.colors.black}
    />
  );

  return (
    <ParticipationCTAContent
      currentPhase={currentPhase}
      CTAButton={CTAButton}
      hasUserParticipated={hasUserParticipated}
    />
  );
};

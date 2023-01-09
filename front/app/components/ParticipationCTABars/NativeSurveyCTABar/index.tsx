import React, { useEffect, useState } from 'react';

// Components
import IdeaButton from 'components/IdeaButton';
import { ParticipationCTAContent } from 'components/ParticipationCTABars/ParticipationCTAContent';

// hooks
import { useTheme } from 'styled-components';
import useAuthUser from 'hooks/useAuthUser';

// services
import { IPhaseData, getCurrentPhase, getLastPhase } from 'services/phases';
import { IProjectData } from 'services/projects';
import { getIdeaPostingRules } from 'services/actionTakingRules';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { pastPresentOrFuture } from 'utils/dateUtils';

type CTAProps = {
  project: IProjectData;
  phases: Error | IPhaseData[] | null | undefined;
};

export const NativeSurveyCTABar = ({ phases, project }: CTAProps) => {
  const theme = useTheme();
  const authUser = useAuthUser();
  const [currentPhase, setCurrentPhase] = useState<IPhaseData | null>(null);
  const hasProjectEnded = currentPhase
    ? pastPresentOrFuture([
        currentPhase.attributes.start_at,
        currentPhase.attributes.end_at,
      ]) === 'past'
    : false;

  useEffect(() => {
    setCurrentPhase(getCurrentPhase(phases) || getLastPhase(phases));
  }, [phases]);

  const { publication_status } = project.attributes;
  const isPhaseNativeSurvey =
    currentPhase?.attributes.participation_method === 'native_survey';
  const { disabledReason } = getIdeaPostingRules({
    project,
    phase: !isNilOrError(currentPhase) ? currentPhase : null,
    authUser,
  });
  const hasUserParticipated = disabledReason === 'postingLimitedMaxReached';

  if (hasProjectEnded || publication_status === 'archived') {
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
      icon="arrow-right"
      iconPos="right"
      iconColor={theme.colors.tenantText}
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

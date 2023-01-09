import React, { useEffect, useState } from 'react';

// Components
import { Box } from '@citizenlab/cl2-component-library';
import IdeaButton from 'components/IdeaButton';
import { ParticipationCTAContent } from 'components/ParticipationCTAButtons/ParticipationCTAContent';

// hooks
import { useTheme } from 'styled-components';

// services
import { IPhaseData, getCurrentPhase, getLastPhase } from 'services/phases';
import { IProjectData } from 'services/projects';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { pastPresentOrFuture } from 'utils/dateUtils';

type CTAProps = {
  project: IProjectData;
  phases: Error | IPhaseData[] | null | undefined;
};

export const NativeSurveyCTAButton = ({ phases, project }: CTAProps) => {
  const theme = useTheme();
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

  if (isNilOrError(project)) {
    return null;
  }

  const { publication_status } = project.attributes;
  const isPhaseNativeSurvey =
    currentPhase?.attributes.participation_method === 'native_survey';

  if (hasProjectEnded || publication_status === 'archived') {
    return null;
  }

  const CTAButton = (
    <Box display="flex" justifyContent="flex-end">
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
    </Box>
  );

  return (
    <ParticipationCTAContent
      project={project}
      phases={phases}
      CTAButton={CTAButton}
    />
  );
};

import React, { useEffect, useState } from 'react';

// Components
import { Box } from '@citizenlab/cl2-component-library';
import IdeaButton from 'components/IdeaButton';
import { ParticipationCTAContent } from 'components/ParticipationCTABars/ParticipationCTAContent';

// hooks
import { useTheme } from 'styled-components';

// services
import { IPhaseData, getCurrentPhase, getLastPhase } from 'services/phases';
import { IProjectData } from 'services/projects';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';

type CTAProps = {
  project: IProjectData;
  phases: Error | IPhaseData[] | null | undefined;
};

export const IdeationCTABar = ({ phases, project }: CTAProps) => {
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

  const { publication_status } = project.attributes;
  const isPhaseIdeation =
    currentPhase?.attributes.participation_method === 'ideation';

  if (hasProjectEnded || publication_status === 'archived') {
    return null;
  }

  const CTAButton = (
    <Box display="flex" justifyContent="flex-end">
      <IdeaButton
        projectId={project.id}
        participationContextType={isPhaseIdeation ? 'phase' : 'project'}
        phaseId={isPhaseIdeation ? currentPhase.id : ''}
        fontWeight="500"
        bgColor={theme.colors.white}
        textColor={theme.colors.tenantText}
      />
    </Box>
  );

  return (
    <ParticipationCTAContent
      currentPhase={currentPhase}
      CTAButton={CTAButton}
    />
  );
};

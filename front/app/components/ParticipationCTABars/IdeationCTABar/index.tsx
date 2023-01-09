import React, { useEffect, useState } from 'react';

// Components
import { Box, Button } from '@citizenlab/cl2-component-library';
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
import { pastPresentOrFuture } from 'utils/dateUtils';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

type CTAProps = {
  project: IProjectData;
  phases: Error | IPhaseData[] | null | undefined;
};

export const IdeationCTABar = ({ phases, project }: CTAProps) => {
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
  const isPhaseIdeation =
    currentPhase?.attributes.participation_method === 'ideation';

  if (hasProjectEnded || publication_status === 'archived') {
    return null;
  }

  const { enabled, disabledReason } = getIdeaPostingRules({
    project,
    phase: !isNilOrError(currentPhase) ? currentPhase : null,
    authUser,
  });
  const hasUserParticipated = disabledReason === 'postingLimitedMaxReached';

  let CTAButton: React.ReactNode = null;

  if (!hasUserParticipated) {
    CTAButton = enabled ? (
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
    ) : (
      <Button
        buttonStyle="secondary"
        onClick={() => {
          // Scroll to ideas
        }}
        fontWeight="500"
        bgColor={theme.colors.white}
        textColor={theme.colors.tenantText}
        iconColor={theme.colors.tenantText}
      >
        <FormattedMessage {...messages.seeIdeas} />
      </Button>
    );
  } else {
    CTAButton = null;
  }

  return (
    <ParticipationCTAContent
      currentPhase={currentPhase}
      CTAButton={CTAButton}
      hasUserParticipated={hasUserParticipated}
    />
  );
};

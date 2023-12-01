import React, { useEffect, useState, FormEvent } from 'react';

// Components
import { Box, Button, useBreakpoint } from '@citizenlab/cl2-component-library';
import IdeaButton from 'components/IdeaButton';
import ParticipationCTAContent from 'components/ParticipationCTABars/ParticipationCTAContent';

// hooks
import { useTheme } from 'styled-components';
import useAuthUser from 'api/me/useAuthUser';

// services
import { getCurrentPhase, getLastPhase } from 'api/phases/utils';
import { IPhaseData } from 'api/phases/types';
import { getIdeaPostingRules } from 'utils/actionTakingRules';

// utils
import { scrollToElement } from 'utils/scroll';
import {
  CTABarProps,
  hasProjectEndedOrIsArchived,
} from 'components/ParticipationCTABars/utils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const IdeationCTABar = ({ phases, project }: CTABarProps) => {
  const theme = useTheme();
  const { data: authUser } = useAuthUser();
  const [currentPhase, setCurrentPhase] = useState<IPhaseData | undefined>();
  const isSmallerThanPhone = useBreakpoint('phone');

  useEffect(() => {
    setCurrentPhase(getCurrentPhase(phases) || getLastPhase(phases));
  }, [phases]);

  if (hasProjectEndedOrIsArchived(project, currentPhase)) {
    return null;
  }

  const { enabled } = getIdeaPostingRules({
    project,
    phase: currentPhase,
    authUser: authUser?.data,
  });

  const scrollToIdeas = (event: FormEvent) => {
    event.preventDefault();

    scrollToElement({ id: 'project-ideas', shouldFocus: true });
  };

  return (
    <ParticipationCTAContent
      currentPhase={currentPhase}
      CTAButton={
        enabled ? (
          <Box width="100%">
            <IdeaButton
              id="e2e-ideation-cta-button"
              projectId={project.id}
              fontWeight="500"
              bgColor={theme.colors.white}
              textColor={theme.colors.tenantText}
              textHoverColor={theme.colors.black}
              icon={!isSmallerThanPhone ? 'arrow-right' : undefined}
              iconPos="right"
              iconColor={theme.colors.tenantText}
              iconHoverColor={theme.colors.black}
              phase={currentPhase}
              iconSize="20px"
              padding="6px 12px"
              fontSize="14px"
              participationMethod="ideation"
            />
          </Box>
        ) : (
          <Button
            id="e2e-ideation-see-ideas-button"
            buttonStyle="secondary"
            onClick={scrollToIdeas}
            fontWeight="500"
            bgColor={theme.colors.white}
            textColor={theme.colors.tenantText}
            textHoverColor={theme.colors.black}
            padding="6px 12px"
            fontSize="14px"
          >
            <FormattedMessage {...messages.seeIdeas} />
          </Button>
        )
      }
    />
  );
};

export default IdeationCTABar;

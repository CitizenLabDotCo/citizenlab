import React, { useEffect, useState, FormEvent } from 'react';

import { Box, Button, useBreakpoint } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';
import { IPhaseData } from 'api/phases/types';
import { getCurrentPhase, getInputTerm, getLastPhase } from 'api/phases/utils';

import IdeaButton from 'components/IdeaButton';
import ParticipationCTAContent from 'components/ParticipationCTABars/ParticipationCTAContent';
import {
  CTABarProps,
  hasProjectEndedOrIsArchived,
} from 'components/ParticipationCTABars/utils';

import { getIdeaPostingRules } from 'utils/actionTakingRules';
import { FormattedMessage } from 'utils/cl-intl';
import { getInputTermMessage } from 'utils/i18n';
import { scrollToElement } from 'utils/scroll';

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
              dataCy="e2e-ideation-start-idea-button"
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
            buttonStyle="secondary-outlined"
            onClick={scrollToIdeas}
            fontWeight="500"
            bgColor={theme.colors.white}
            textColor={theme.colors.tenantText}
            bgHoverColor={theme.colors.grey100}
            padding="6px 12px"
            fontSize="14px"
          >
            <FormattedMessage
              {...getInputTermMessage(getInputTerm(phases), {
                idea: messages.seeIdeas,
                option: messages.seeOptions,
                project: messages.seeProjects,
                question: messages.seeQuestions,
                issue: messages.seeIssues,
                contribution: messages.seeContributions,
                proposal: messages.seeProposals,
                initiative: messages.seeInitiatives,
                petition: messages.seePetitions,
              })}
            />
          </Button>
        )
      }
    />
  );
};

export default IdeationCTABar;

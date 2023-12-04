import React, { useState } from 'react';

// hooks
import useBasket from 'api/baskets/useBasket';
import useUpdateBasket from 'api/baskets/useUpdateBasket';
import useVoting from 'api/baskets_ideas/useVoting';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useProjectById from 'api/projects/useProjectById';
import useIdeas from 'api/ideas/useIdeas';

// components
import { Box, Button } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';
import VotesLeftModal from './VotesLeftModal';

// styling
import styled, { useTheme } from 'styled-components';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';
import useLocalize from 'hooks/useLocalize';

// utils
import JSConfetti from 'js-confetti';
import { scrollToElement } from 'utils/scroll';
import { getDisabledExplanation } from './utils';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';

const confetti = new JSConfetti();

const StyledButton = styled(Button)`
  &.pulse {
    animation-name: pulse;
    animation-duration: 1.3s;
    animation-timing-function: ease;
    animation-delay: 0.3s;
    animation-iteration-count: infinite;
  }

  /* border-radius */
  -webkit-border-radius: 3px;
  -moz-border-radius: 3px;
  border-radius: 3px;

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 255, 255, 1);
    }
    100% {
      box-shadow: 0 0 0 6px rgba(255, 255, 255, 0);
    }
  }
`;
interface Props {
  participationContext: IProjectData | IPhaseData;
  projectId?: string;
}

const CTAButton = ({ participationContext, projectId }: Props) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: appConfig } = useAppConfiguration();
  const { data: project } = useProjectById(projectId);
  const { data: ideas } = useIdeas({ phase: participationContext.id });

  const basketId = participationContext.relationships.user_basket?.data?.id;
  const { data: basket } = useBasket(basketId);
  const { mutate: updateBasket } = useUpdateBasket();
  const {
    numberOfVotesCast,
    userHasVotesLeft,
    processing: votingProcessing,
  } = useVoting();

  const [processing, setProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const votingMethod = participationContext.attributes.voting_method;
  const votingMaxTotal = participationContext?.attributes.voting_max_total;
  const currency = appConfig?.data.attributes.settings.core.currency;

  let votesLeft = 0;
  let usedUpBudget = true;

  if (!isNilOrError(votingMaxTotal) && !isNilOrError(numberOfVotesCast)) {
    votesLeft = votingMaxTotal - numberOfVotesCast;
  }

  const ideasUserCanVoteFor = ideas?.data.filter(
    (idea) =>
      votesLeft &&
      votesLeft > 0 &&
      idea.attributes.budget &&
      idea.attributes.budget <= votesLeft &&
      !basket?.data.relationships.ideas.data.find(
        (basketIdea) => idea.id === basketIdea.id
      )
  );

  if (ideasUserCanVoteFor?.length && ideasUserCanVoteFor.length >= 1) {
    usedUpBudget = false;
  }

  const disabledExplanation = getDisabledExplanation(
    formatMessage,
    localize,
    participationContext,
    numberOfVotesCast || 0,
    currency
  );

  const handleSubmitOnClick = () => {
    if (!(votingMethod === 'budgeting') && userHasVotesLeft) {
      setShowModal(true);
      return;
    } else if (votingMethod === 'budgeting' && !usedUpBudget) {
      setShowModal(true); // There are still options where the cost is within the user's remaining budget
      return;
    }

    if (basket) {
      const update = () => {
        updateBasket(
          {
            id: basket.data.id,
            submitted: true,
            participation_context_type:
              participationContext.type === 'phase' ? 'Phase' : 'Project',
          },
          {
            onSuccess: () => {
              setProcessing(false);

              // If on the project page, scroll down to the status module
              if (location.pathname.includes('/projects/')) {
                setTimeout(() => {
                  scrollToElement({
                    id: 'voting-status-module',
                  });
                  confetti.addConfetti();
                }, 200);
              }

              // If on the idea page, redirect to project page and scroll to status module
              if (location.pathname.includes('/ideas/')) {
                clHistory.push(
                  `/projects/${project?.data.attributes.slug}?scrollToStatusModule=true`
                );
              }
            },
          }
        );
      };

      if (votingProcessing) {
        // Add a bit of timeout so that the voting request
        // has time to complete
        setTimeout(() => {
          update();
        }, 300);
      } else {
        update();
      }
    }
  };

  return (
    <>
      <Tippy
        disabled={!disabledExplanation}
        interactive={true}
        placement="bottom"
        content={disabledExplanation}
      >
        <Box width="100%">
          <StyledButton
            icon="vote-ballot"
            buttonStyle="secondary"
            iconColor={theme.colors.tenantText}
            onClick={handleSubmitOnClick}
            fontWeight="500"
            bgColor={theme.colors.white}
            textColor={theme.colors.tenantText}
            id="e2e-voting-submit-button"
            textHoverColor={theme.colors.black}
            padding="6px 12px"
            fontSize="14px"
            disabled={!!disabledExplanation}
            processing={processing}
            className={disabledExplanation ? '' : 'pulse'}
          >
            <FormattedMessage {...messages.submit} />
          </StyledButton>
        </Box>
      </Tippy>
      <VotesLeftModal
        showModal={showModal}
        setShowModal={setShowModal}
        project={project}
      />
    </>
  );
};

export default CTAButton;

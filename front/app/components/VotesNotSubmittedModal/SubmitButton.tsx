import React, { useState } from 'react';

// hooks
import useBasket from 'api/baskets/useBasket';
import useUpdateBasket from 'api/baskets/useUpdateBasket';
import useVoting from 'api/baskets_ideas/useVoting';
import { useLocation } from 'react-router-dom';

// components
import { Button } from '@citizenlab/cl2-component-library';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// typings
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';

// utils
import { scrollToElement } from 'utils/scroll';
import clHistory from 'utils/cl-router/history';
import JSConfetti from 'js-confetti';

const confetti = new JSConfetti();

interface Props {
  participationContext: IProjectData | IPhaseData;
  setShowModal: (show: boolean) => void;
  projectSlug?: string;
}

const SubmitButton = ({
  participationContext,
  setShowModal,
  projectSlug,
}: Props) => {
  const [processing, setProcessing] = useState(false);
  const { formatMessage } = useIntl();
  const basketId = participationContext.relationships.user_basket?.data?.id;
  const location = useLocation();
  const { data: basket } = useBasket(basketId);
  const { mutate: updateBasket } = useUpdateBasket();
  const { numberOfVotesCast, processing: votingProcessing } = useVoting();
  const votingMethod = participationContext.attributes.voting_method;
  if (!votingMethod || numberOfVotesCast === undefined) return null;

  const handleSubmitOnClick = () => {
    if (basket) {
      const update = () => {
        updateBasket(
          {
            id: basket.data.id,
            submitted: true,
            participation_context_type: 'Phase',
          },
          {
            onSuccess: () => {
              setProcessing(false);
              setShowModal(false);
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
                  `/projects/${projectSlug}?scrollToStatusModule=true`
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
    <Button onClick={handleSubmitOnClick} processing={processing}>
      {votingMethod === 'budgeting'
        ? formatMessage(messages.submitMyBudget)
        : formatMessage(messages.submitMyVote)}
    </Button>
  );
};

export default SubmitButton;

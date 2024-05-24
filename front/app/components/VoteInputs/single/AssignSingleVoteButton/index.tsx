import React from 'react';

import { Button, colors } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';
import { useSearchParams } from 'react-router-dom';

import useBasket from 'api/baskets/useBasket';
import useVoting from 'api/baskets_ideas/useVoting';
import useIdeaById from 'api/ideas/useIdeaById';
import { IPhaseData } from 'api/phases/types';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';

import { VOTES_EXCEEDED_ERROR_EVENT } from 'components/ErrorToast/events';

import { isFixableByAuthentication } from 'utils/actionDescriptors';
import { useIntl } from 'utils/cl-intl';
import { getPermissionsDisabledMessage } from 'utils/actionDescriptors';
import eventEmitter from 'utils/eventEmitter';

import messages from './messages';

interface Props {
  phase: IPhaseData;
  ideaId: string;
  buttonStyle: 'primary' | 'primary-outlined';
  onIdeaPage?: boolean;
}

const AssignSingleVoteButton = ({
  ideaId,
  buttonStyle,
  phase,
  onIdeaPage,
}: Props) => {
  const { formatMessage } = useIntl();

  const { data: idea } = useIdeaById(ideaId);
  const { data: basket } = useBasket(
    phase.relationships?.user_basket?.data?.id
  );
  const { getVotes, setVotes, numberOfVotesCast } = useVoting();
  const ideaInBasket = !!getVotes?.(ideaId);

  const [searchParams] = useSearchParams();
  const isProcessing = searchParams.get('processing_vote') === ideaId;

  const maxVotes = phase?.attributes.voting_max_total;
  const maxVotesReached = maxVotes && numberOfVotesCast === maxVotes;

  const actionDescriptor = idea?.data.attributes.action_descriptors.voting;

  if (
    !actionDescriptor ||
    actionDescriptor.disabled_reason === 'idea_not_in_current_phase'
  ) {
    return null;
  }

  const vote = () => {
    if (actionDescriptor.enabled) {
      ideaInBasket ? onRemove() : onAdd();
      return;
    }

    if (isFixableByAuthentication(actionDescriptor.disabled_reason)) {
      const phaseId = phase.id;

      const context = {
        type: 'phase',
        action: 'voting',
        id: phaseId,
      } as const;

      const successAction: SuccessAction = {
        name: 'vote',
        params: {
          ideaId,
          phaseId,
          votes: 1,
        },
      };

      triggerAuthenticationFlow({ context, successAction });
    }
  };

  const onAdd = async () => {
    if (numberOfVotesCast === undefined) {
      return;
    }

    if (maxVotesReached) {
      eventEmitter.emit(VOTES_EXCEEDED_ERROR_EVENT);
      return;
    }

    setVotes?.(ideaId, 1);
  };

  const onRemove = async () => {
    setVotes?.(ideaId, 0);
  };

  const getButtonDisabledExplanation = () => {
    const permissionDisabledMessage = getPermissionsDisabledMessage(
      'voting',
      actionDescriptor.disabled_reason,
      phase,
      true
    );
    if (permissionDisabledMessage) {
      return formatMessage(permissionDisabledMessage);
    }

    if (basket?.data?.attributes.submitted_at) {
      return formatMessage(
        onIdeaPage ? messages.votesSubmittedIdeaPage : messages.votesSubmitted,
        { votes: numberOfVotesCast ?? 0 }
      );
    }

    if (maxVotesReached && !ideaInBasket) {
      return formatMessage(messages.maxVotesReached);
    }

    return null;
  };

  const disabledButtonExplanation = getButtonDisabledExplanation();

  return (
    <Tippy
      disabled={!disabledButtonExplanation}
      interactive={true}
      placement="bottom"
      content={disabledButtonExplanation}
    >
      <div>
        <Button
          buttonStyle={ideaInBasket ? 'primary' : buttonStyle}
          bgColor={ideaInBasket ? colors.success : undefined}
          borderColor={ideaInBasket ? colors.success : undefined}
          disabled={!!disabledButtonExplanation}
          processing={isProcessing}
          icon={ideaInBasket ? 'check' : 'vote-ballot'}
          className="e2e-single-vote-button"
          onClick={vote}
          text={
            ideaInBasket
              ? formatMessage(messages.selected)
              : formatMessage(messages.select)
          }
        />
      </div>
    </Tippy>
  );
};

export default AssignSingleVoteButton;

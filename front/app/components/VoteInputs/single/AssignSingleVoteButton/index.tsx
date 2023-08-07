import React from 'react';

// components
import { Button, colors } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';

// api
import useIdeaById from 'api/ideas/useIdeaById';
import useBasket from 'api/baskets/useBasket';
import useVoting from 'api/baskets_ideas/useVoting';

// events
import eventEmitter from 'utils/eventEmitter';
import { VOTES_EXCEEDED_ERROR_EVENT } from 'components/ErrorToast/events';
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// routing
import { useSearchParams } from 'react-router-dom';

// utils
import { isFixableByAuthentication } from 'utils/actionDescriptors';

// types
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';

interface Props {
  participationContext: IPhaseData | IProjectData;
  ideaId: string;
  buttonStyle: 'primary' | 'primary-outlined';
  onIdeaPage?: boolean;
}

const AssignSingleVoteButton = ({
  ideaId,
  buttonStyle,
  participationContext,
  onIdeaPage,
}: Props) => {
  const { formatMessage } = useIntl();

  const { data: idea } = useIdeaById(ideaId);
  const { data: basket } = useBasket(
    participationContext.relationships?.user_basket?.data?.id
  );
  const { getVotes, setVotes, numberOfVotesCast } = useVoting();
  const ideaInBasket = !!getVotes?.(ideaId);

  const [searchParams] = useSearchParams();
  const isProcessing = searchParams.get('processing_vote') === ideaId;

  // permissions
  const actionDescriptor = idea?.data.attributes.action_descriptor.voting;

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
      const participationContextId = participationContext.id;
      const participationContextType = participationContext.type;

      const context = {
        type: participationContextType,
        action: 'voting',
        id: participationContextId,
      } as const;

      const successAction: SuccessAction = {
        name: 'vote',
        params: {
          ideaId,
          participationContextId,
          participationContextType,
          votes: 1,
        },
      };

      triggerAuthenticationFlow({ context, successAction });
    }
  };

  const onAdd = async () => {
    const maxVotes = participationContext?.attributes.voting_max_total;
    if (numberOfVotesCast === undefined) {
      return;
    }

    if (maxVotes && numberOfVotesCast === maxVotes) {
      eventEmitter.emit(VOTES_EXCEEDED_ERROR_EVENT);
      return;
    }

    setVotes?.(ideaId, 1);
  };

  const onRemove = async () => {
    setVotes?.(ideaId, 0);
  };

  const buttonDisabledExplanation = basket?.data?.attributes.submitted_at
    ? formatMessage(
        onIdeaPage ? messages.votesSubmittedIdeaPage : messages.votesSubmitted,
        { votes: numberOfVotesCast ?? 0 }
      )
    : undefined;

  return (
    <Tippy
      disabled={!buttonDisabledExplanation}
      interactive={true}
      placement="bottom"
      content={buttonDisabledExplanation}
    >
      <div>
        <Button
          buttonStyle={ideaInBasket ? 'primary' : buttonStyle}
          bgColor={ideaInBasket ? colors.success : undefined}
          borderColor={ideaInBasket ? colors.success : undefined}
          disabled={!!buttonDisabledExplanation}
          processing={isProcessing}
          icon={ideaInBasket ? 'check' : 'vote-ballot'}
          className="e2e-single-vote-button"
          onClick={vote}
          text={
            ideaInBasket
              ? formatMessage(messages.voted)
              : formatMessage(messages.vote)
          }
        />
      </div>
    </Tippy>
  );
};

export default AssignSingleVoteButton;

import React from 'react';

// components
import { Button, colors } from '@citizenlab/cl2-component-library';

// utils
import { isNilOrError } from 'utils/helperUtils';
import eventEmitter from 'utils/eventEmitter';
import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';
import { isFixableByAuthentication } from 'utils/actionDescriptors';

// api
import useBasket from 'api/baskets/useBasket';
import useAddBasketsIdeas from 'api/baskets_ideas/useAddBasketsIdeas';
import useDeleteBasketsIdea from 'api/baskets_ideas/useDeleteBasketsIdea';
import useAddBasket from 'api/baskets/useAddBasket';
import useBasketsIdeas from 'api/baskets_ideas/useBasketsIdeas';
import useIdeaById from 'api/ideas/useIdeaById';

// types
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';
import { IParticipationContextType } from 'typings';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

export const VOTES_EXCEEDED_ERROR_EVENT = 'votesExceededError';

interface Props {
  projectId: string;
  participationContext?: IPhaseData | IProjectData | null;
  ideaId: string;
  buttonStyle: 'primary' | 'primary-outlined';
}

const AssignSingleVoteButton = ({
  projectId,
  ideaId,
  buttonStyle,
  participationContext,
}: Props) => {
  const { formatMessage } = useIntl();

  // participation context
  const contextType =
    participationContext?.type === 'phase' ? 'Phase' : 'Project';
  const { data: idea } = useIdeaById(ideaId);

  // basket
  const { data: basket } = useBasket(
    participationContext?.relationships?.user_basket?.data?.id
  );
  const { mutate: addBasket } = useAddBasket(projectId);
  const { mutateAsync: addBasketsIdeas, isLoading: isAddingToBasket } =
    useAddBasketsIdeas();
  const { mutateAsync: deleteBasketsIdea, isLoading: isRemovingFromBasket } =
    useDeleteBasketsIdea();
  const { data: basketsIdeas } = useBasketsIdeas(basket?.data.id);

  const ideaInBasket = basket?.data.relationships.ideas.data.find(
    (idea) => idea.id === ideaId
  );
  const isLoading = isAddingToBasket || isRemovingFromBasket;

  // permissions
  const actionDescriptor = idea?.data.attributes.action_descriptor.voting;
  if (!actionDescriptor) return null;

  const onAdd = async () => {
    const votingDisabledReason = actionDescriptor.disabled_reason;

    if (!participationContext) {
      return;
    }

    // trigger authentication flow if not permitted
    if (
      votingDisabledReason &&
      isFixableByAuthentication(votingDisabledReason)
    ) {
      const context = {
        type: participationContext.type as IParticipationContextType,
        action: 'voting',
        id: participationContext.id,
      } as const;

      const successAction: SuccessAction = {
        name: 'assignSingleVote',
        params: {
          ideaId,
          participationContextId: participationContext.id,
          participationContextType:
            participationContext.type as IParticipationContextType,
          basket: basket?.data,
        },
      };

      triggerAuthenticationFlow({ context, successAction });
    }

    if (basket) {
      const votingMaxTotal = participationContext?.attributes?.voting_max_total;
      if (
        votingMaxTotal &&
        basket.data.attributes.total_votes + 1 > votingMaxTotal
      ) {
        eventEmitter.emit(VOTES_EXCEEDED_ERROR_EVENT);
      } else {
        addBasketsIdeas({
          idea_id: ideaId,
          basketId: basket?.data.id,
          votes: 1,
        });
      }
    } else if (participationContext) {
      addBasket(
        {
          participation_context_id: participationContext?.id,
          participation_context_type: contextType,
        },
        {
          onSuccess: (response) => {
            addBasketsIdeas({
              idea_id: ideaId,
              basketId: response.data.id,
              votes: 1,
            });
          },
        }
      );
    }
  };

  const onRemove = async () => {
    if (basket) {
      basketsIdeas?.data.map((basketIdea) => {
        if (basketIdea.relationships.idea.data['id'] === ideaId) {
          deleteBasketsIdea({
            basketIdeaId: basketIdea.id,
            basketId: basket?.data.id,
          });
        }
      });
    }
  };

  return (
    <Button
      buttonStyle={ideaInBasket ? 'primary' : buttonStyle}
      bgColor={ideaInBasket ? colors.success : undefined}
      borderColor={ideaInBasket ? colors.success : undefined}
      disabled={!isNilOrError(basket?.data?.attributes.submitted_at)}
      icon={ideaInBasket ? 'check' : 'vote-ballot'}
      onClick={() => (ideaInBasket ? onRemove() : onAdd())}
      text={
        ideaInBasket
          ? formatMessage(messages.voted)
          : formatMessage(messages.vote)
      }
      width="100%"
      minWidth="240px"
      processing={isLoading}
    />
  );
};

export default AssignSingleVoteButton;

import React from 'react';

// components
import { Button, colors } from '@citizenlab/cl2-component-library';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { getCurrentPhase } from 'api/phases/utils';

// api
import useBasket from 'api/baskets/useBasket';
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import useAddBasketsIdeas from 'api/baskets_ideas/useAddBasketsIdeas';
import useDeleteBasketsIdea from 'api/baskets_ideas/useDeleteBasketsIdea';
import useAddBasket from 'api/baskets/useAddBasket';
import useBasketsIdeas from 'api/baskets_ideas/useBasketsIdeas';
import { IPhaseData } from 'api/phases/types';
import eventEmitter from 'utils/eventEmitter';

export const VOTES_EXCEEDED_ERROR_EVENT = 'votesExceededError';
export const VOTES_PER_OPTION_EXCEEDED_ERROR_EVENT =
  'votesPerOptionExceededError';

interface Props {
  projectId: string;
  viewingPhase?: IPhaseData | null;
  ideaId: string;
}

const AssignSingleVotesControl = ({
  projectId,
  ideaId,
  viewingPhase,
}: Props) => {
  // participation context
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const participationContext =
    viewingPhase || getCurrentPhase(phases?.data) || project?.data;
  const contextType =
    participationContext?.type === 'phase' ? 'Phase' : 'Project';
  const { data: basket } = useBasket(
    participationContext?.relationships?.user_basket?.data?.id
  );

  // basket
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

  const onAdd = async () => {
    if (basket && participationContext?.attributes?.voting_max_total) {
      if (
        basket.data.attributes.total_votes + 1 >
        participationContext?.attributes?.voting_max_total
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
      buttonStyle={ideaInBasket ? 'primary' : 'primary-outlined'}
      bgColor={ideaInBasket ? colors.success : undefined}
      disabled={!isNilOrError(basket?.data?.attributes.submitted_at)}
      icon={ideaInBasket ? 'check' : 'vote-ballot'}
      onClick={() => (ideaInBasket ? onRemove() : onAdd())}
      text={ideaInBasket ? 'Voted' : 'Vote'}
      width="100%"
      minWidth="240px"
      processing={isLoading}
    />
  );
};

export default AssignSingleVotesControl;

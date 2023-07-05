import { useCallback, useMemo } from 'react';
import { debounce } from 'lodash-es';

// api
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import useBasket from 'api/baskets/useBasket';
import useBasketsIdeas from './useBasketsIdeas';

// mutations
import useAddBasket from 'api/baskets/useAddBasket';
import useAddBasketsIdea from 'api/baskets_ideas/useAddBasketsIdeas';
import useUpdateBasketsIdea from 'api/baskets_ideas/useUpdateBasketsIdea';
import useDeleteBasketsIdea from 'api/baskets_ideas/useDeleteBasketsIdea';

// utils
import { getCurrentParticipationContext } from 'api/phases/utils';

interface Props {
  projectId: string;
}

const useAssignVote = ({ projectId }: Props) => {
  // api
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);

  const participationContext = getCurrentParticipationContext(
    project?.data,
    phases?.data
  );
  const basketId = participationContext?.relationships?.user_basket?.data?.id;
  const participation_context_type =
    project?.data.attributes.process_type === 'continuous'
      ? 'Project'
      : 'Phase';

  const { data: basket } = useBasket(basketId);
  const { data: basketIdeas } = useBasketsIdeas(basketId);

  // mutations
  const { mutateAsync: deleteBasketsIdea } = useDeleteBasketsIdea();
  const { mutateAsync: addBasket } = useAddBasket(projectId);
  const { mutateAsync: addBasketsIdea } = useAddBasketsIdea();
  const { mutateAsync: updateBasketsIdea } = useUpdateBasketsIdea();

  const basketIdeaIdPerIdeaId = useMemo<Record<string, string>>(() => {
    if (!basketIdeas) return {};

    return basketIdeas.data.reduce((acc, basketIdea) => {
      const ideaId = basketIdea.relationships.idea.data.id;
      const basketIdeaId = basketIdea.id;

      return {
        ...acc,
        [ideaId]: basketIdeaId,
      };
    }, {});
  }, [basketIdeas]);

  const handleBasketUpdate = useCallback(
    (ideaId: string, newVotes: number) => {
      if (!participationContext) return;

      if (!basket) {
        // Create basket, and on success add new basketsIdea
        addBasket(
          {
            participation_context_id: participationContext.id,
            participation_context_type,
          },
          {
            onSuccess: (basket) => {
              addBasketsIdea({
                basketId: basket.data.id,
                idea_id: ideaId,
                votes: newVotes,
              });
            },
          }
        );
      }

      if (basket) {
        const existsInBasket = ideaId in basketIdeaIdPerIdeaId;

        if (!existsInBasket) {
          // Add new baskets idea
          addBasketsIdea({
            basketId: basket.data.id,
            idea_id: ideaId,
            votes: newVotes,
          });
        } else {
          const basketIdeaId = basketIdeaIdPerIdeaId[ideaId];

          if (newVotes === 0) {
            deleteBasketsIdea({
              basketId: basket.data.id,
              basketIdeaId,
            });
          } else {
            // Update existing baskets idea
            updateBasketsIdea({
              basketId: basket.data.id,
              basketIdeaId,
              votes: newVotes,
            });
          }
        }
      }
    },
    [
      addBasket,
      addBasketsIdea,
      deleteBasketsIdea,
      updateBasketsIdea,
      basket,
      participationContext,
      participation_context_type,
      basketIdeaIdPerIdeaId,
    ]
  );

  // Debounced update function
  const assignVote = useMemo(() => {
    return debounce(handleBasketUpdate, 500);
  }, [handleBasketUpdate]);

  return assignVote;
};

export default useAssignVote;

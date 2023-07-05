import { useCallback, useMemo } from 'react';
import { debounce } from 'lodash-es';

// api
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import useBasket from 'api/baskets/useBasket';

// mutations
import useAddBasket from 'api/baskets/useAddBasket';
import useAddBasketsIdea from 'api/baskets_ideas/useAddBasketsIdeas';
import useUpdateBasketsIdea from 'api/baskets_ideas/useUpdateBasketsIdea';
import useDeleteBasketsIdea from 'api/baskets_ideas/useDeleteBasketsIdea';

// utils
import { getCurrentParticipationContext } from 'api/phases/utils';

interface Props {
  projectId: string;
  ideaId: string;
}

// TODO figure out how to derive this
const BASKET_EXISTS = false;

const useAssignVote = ({ projectId, ideaId }: Props) => {
  // api
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);

  const participationContext = getCurrentParticipationContext(
    project?.data,
    phases?.data
  );
  const basketId = participationContext?.relationships?.user_basket?.data?.id;

  const { data: basket } = useBasket(basketId);

  // mutations
  const { mutateAsync: deleteBasketsIdea } = useDeleteBasketsIdea();
  const { mutateAsync: addBasket } = useAddBasket(projectId);
  const { mutateAsync: addBasketsIdea } = useAddBasketsIdea();
  const { mutateAsync: updateBasketsIdea } = useUpdateBasketsIdea();

  const handleBasketUpdate = useCallback(
    (votes: number) => {
      if (!participationContext) return;

      if (!basket) {
        // Create basket, and on success add new basketsIdea
        addBasket(
          {
            participation_context_id: participationContext.id,
            participation_context_type: phases ? 'Phase' : 'Project',
          },
          {
            onSuccess: (basket) => {
              addBasketsIdea({
                basketId: basket.data.id,
                idea_id: ideaId,
                votes,
              });
            },
          }
        );
      }

      if (basket) {
        if (!BASKET_EXISTS) {
          // Add new baskets idea
          addBasketsIdea({
            basketId: basket.data.id,
            idea_id: ideaId,
            votes,
          });
        } else {
          if (votes === 0) {
            deleteBasketsIdea({
              basketId: basket.data.id,
              basketIdeaId: ideaId,
            });
          } else {
            // Update existing baskets idea
            updateBasketsIdea({
              basketId: basket.data.id,
              basketsIdeaId: ideaId,
              votes,
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
      ideaId,
      participationContext,
      phases,
    ]
  );

  // Debounced update function
  const assignVote = useMemo(() => {
    return debounce(handleBasketUpdate, 100);
  }, [handleBasketUpdate]);

  return { assignVote };
};

export default useAssignVote;

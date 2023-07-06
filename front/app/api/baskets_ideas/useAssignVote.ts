import { useState, useCallback, useMemo } from 'react';
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
  const [processing, setProcessing] = useState(false);

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

  const basketExists = !!basket;

  const handleBasketUpdate = useCallback(
    async (ideaId: string, newVotes: number) => {
      if (!participationContext) return;

      if (!basketExists) {
        const basket = await addBasket({
          participation_context_id: participationContext.id,
          participation_context_type,
        });

        await addBasketsIdea({
          basketId: basket.data.id,
          idea_id: ideaId,
          votes: newVotes,
        });
      }

      if (basketExists) {
        const existsInBasket = ideaId in basketIdeaIdPerIdeaId;

        if (!existsInBasket) {
          // Add new baskets idea
          await addBasketsIdea({
            basketId: basket.data.id,
            idea_id: ideaId,
            votes: newVotes,
          });
        } else {
          const basketIdeaId = basketIdeaIdPerIdeaId[ideaId];

          if (newVotes === 0) {
            await deleteBasketsIdea({
              basketId: basket.data.id,
              basketIdeaId,
            });
          } else {
            // Update existing baskets idea
            await updateBasketsIdea({
              basketId: basket.data.id,
              basketIdeaId,
              votes: newVotes,
            });
          }
        }
      }

      setProcessing(false);
    },
    [
      addBasket,
      addBasketsIdea,
      deleteBasketsIdea,
      updateBasketsIdea,
      basketExists,
      basket?.data.id,
      participationContext,
      participation_context_type,
      basketIdeaIdPerIdeaId,
    ]
  );

  // Debounced update function
  const handleBasketUpdateDebounced = useMemo(() => {
    return debounce(handleBasketUpdate, 300);
  }, [handleBasketUpdate]);

  const updateBasket = useCallback(
    async (ideaId: string, newVotes: number) => {
      setProcessing(true);
      await handleBasketUpdateDebounced(ideaId, newVotes);
    },
    [handleBasketUpdateDebounced]
  );

  const cancel = useCallback(() => {
    handleBasketUpdateDebounced.cancel();
    setProcessing(false);
  }, [handleBasketUpdateDebounced]);

  return { updateBasket, processing, cancel };
};

export default useAssignVote;

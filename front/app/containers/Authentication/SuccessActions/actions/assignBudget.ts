// api
import { fetchIdea } from 'api/ideas/useIdeaById';
import { fetchProjectById } from 'api/projects/useProjectById';
import { fetchPhase } from 'api/phases/usePhase';
import { voteForIdea } from 'api/baskets_ideas/useVoteForIdea';
import { queryClient } from 'utils/cl-react-query/queryClient';
import basketsKeys from 'api/baskets/keys';
import basketsIdeasKeys from 'api/baskets_ideas/keys';
import { fetchBasketsIdeas } from 'api/baskets_ideas/useBasketsIdeas';

// utils
import { isIdeaInBasket } from 'components/AddToBasketButton/utils';

export interface AssignBudgetParams {
  ideaId: string;
  participationContextId: string;
  participationContextType: 'project' | 'phase';
}

export const assignBudget =
  ({
    ideaId,
    participationContextId,
    participationContextType,
  }: AssignBudgetParams) =>
  async () => {
    const ideaPromise = fetchIdea({ id: ideaId });

    const participationContextPromise =
      participationContextType === 'project'
        ? fetchProjectById({ id: participationContextId })
        : fetchPhase({ phaseId: participationContextId });

    const [idea, participationContext] = await Promise.all([
      ideaPromise,
      participationContextPromise,
    ]);

    const ideaBudget = idea.data.attributes.budget;
    if (!ideaBudget) return;

    const basketId =
      participationContext.data.relationships.user_basket?.data?.id;

    // If no basket exists, the idea is definitely not in the basket
    // yet, so we can add it to the basket (the BE will create the
    // basket automatically)
    if (!basketId) {
      await addToBasketAndInvalidateCache({ ideaId, ideaBudget });
      return;
    }

    const basketsIdeas = await fetchBasketsIdeas({ basketId });
    const ideaInBasket = isIdeaInBasket(ideaId, basketsIdeas);

    // If a basket exists and the idea is already in the basket,
    // we do nothing
    if (ideaInBasket) return;

    await addToBasketAndInvalidateCache({ ideaId, ideaBudget });
  };

const addToBasketAndInvalidateCache = async ({
  ideaId,
  ideaBudget,
}: {
  ideaId: string;
  ideaBudget: number;
}) => {
  const response = await voteForIdea({
    idea_id: ideaId,
    votes: ideaBudget,
  });

  const newBasketId = response.data.relationships.basket.data.id;

  queryClient.invalidateQueries({
    queryKey: basketsKeys.item({ id: newBasketId }),
  });
  queryClient.invalidateQueries({
    queryKey: basketsIdeasKeys.item({ basketId: newBasketId }),
  });
};

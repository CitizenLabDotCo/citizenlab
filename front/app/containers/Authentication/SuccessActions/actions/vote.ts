// api
import { fetchProjectById } from 'api/projects/useProjectById';
import { fetchPhase } from 'api/phases/usePhase';
import { voteForIdea } from 'api/baskets_ideas/useVoteForIdea';
import { queryClient } from 'utils/cl-react-query/queryClient';
import basketsKeys from 'api/baskets/keys';
import basketsIdeasKeys from 'api/baskets_ideas/keys';
import { fetchBasketsIdeas } from 'api/baskets_ideas/useBasketsIdeas';

// utils
import { isIdeaInBasket } from 'components/AddToBasketButton/utils';

export interface VoteParams {
  ideaId: string;
  participationContextId: string;
  participationContextType: 'project' | 'phase';
  votes: number;
}

export const vote =
  ({
    ideaId,
    participationContextId,
    participationContextType,
    votes,
  }: VoteParams) =>
  async () => {
    const participationContext =
      participationContextType === 'project'
        ? await fetchProjectById({ id: participationContextId })
        : await fetchPhase({ phaseId: participationContextId });

    const basketId =
      participationContext.data.relationships.user_basket?.data?.id;

    // If no basket exists, the idea is definitely not in the basket
    // yet, so we can add it to the basket (the BE will create the
    // basket automatically)
    if (!basketId) {
      await addToBasketAndInvalidateCache({ ideaId, votes });
      return;
    }

    const basketsIdeas = await fetchBasketsIdeas({ basketId });
    const ideaInBasket = isIdeaInBasket(ideaId, basketsIdeas);

    // If a basket exists and the idea is already in the basket,
    // we do nothing
    if (ideaInBasket) return;

    await addToBasketAndInvalidateCache({ ideaId, votes });
  };

const addToBasketAndInvalidateCache = async ({
  ideaId,
  votes,
}: {
  ideaId: string;
  votes: number;
}) => {
  const response = await voteForIdea({
    idea_id: ideaId,
    votes,
  });

  const newBasketId = response.data.relationships.basket.data.id;

  queryClient.invalidateQueries({
    queryKey: basketsKeys.item({ id: newBasketId }),
  });
  queryClient.invalidateQueries({
    queryKey: basketsIdeasKeys.item({ basketId: newBasketId }),
  });
};

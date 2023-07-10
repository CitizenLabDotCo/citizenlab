// api
import { fetchIdea } from 'api/ideas/useIdeaById';
import { fetchProjectById } from 'api/projects/useProjectById';
import { fetchPhase } from 'api/phases/usePhase';
import { addIdeaToBasket } from 'api/baskets/useAddIdeaToBasket';
import { queryClient } from 'utils/cl-react-query/queryClient';
import basketsKeys from 'api/baskets/keys';
import basketsIdeasKeys from 'api/baskets_ideas/keys';

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

    const isInBasket =
      !!participationContext.data.relationships.user_basket?.data?.id;
    if (isInBasket) return;

    const response = await addIdeaToBasket({
      idea_id: ideaId,
      votes: ideaBudget,
    });
    const basketId = response.data.relationships.basket.data.id;

    queryClient.invalidateQueries({
      queryKey: basketsKeys.item({ id: basketId }),
    });
    queryClient.invalidateQueries({
      queryKey: basketsIdeasKeys.item({ basketId }),
    });
  };

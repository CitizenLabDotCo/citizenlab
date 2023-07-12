// api
import { IBasketData } from 'api/baskets/types';
import { addBasket } from 'api/baskets/useAddBasket';
import { fetchBasketsIdeas } from 'api/baskets_ideas/useBasketsIdeas';
import { addBasketsIdea } from 'api/baskets_ideas/useAddBasketsIdeas';
import { fetchIdea } from 'api/ideas/useIdeaById';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from 'components/AddToBasketButton/tracks';

// utils
import { isNil, capitalizeParticipationContextType } from 'utils/helperUtils';

// typings
import { IParticipationContextType } from 'typings';
import { getCurrentBasketsIdeas } from 'components/AddToBasketButton/useAssignBudget';

export interface AssignBudgetParams {
  ideaId: string;
  participationContextId: string;
  participationContextType: IParticipationContextType;
  basket: IBasketData | null | undefined;
}

export const assignBudget =
  ({
    ideaId,
    participationContextId,
    participationContextType,
    basket,
  }: AssignBudgetParams) =>
  async () => {
    const idea = await fetchIdea({ id: ideaId });

    if (!isNil(basket)) {
      const basketsIdeas =
        (await fetchBasketsIdeas({ basketId: basket.id })) || [];
      const currentBasketIdeas = getCurrentBasketsIdeas(basketsIdeas);
      const ideaInBasket = currentBasketIdeas.find(
        (basketIdea) => basketIdea.ideaId === ideaId
      );

      idea;
      ideaInBasket;

      trackEventByName(tracks.ideaAddedToBasket);
    } else {
      try {
        const result = await addBasket({
          participation_context_id: participationContextId,
          participation_context_type: capitalizeParticipationContextType(
            participationContextType
          ),
        });
        await addBasketsIdea({ basketId: result.data.id, idea_id: ideaId });
        // queryClient.invalidateQueries({
        //   queryKey: basketsKeys.item({ id: result.data.id }),
        // });
        trackEventByName(tracks.basketCreated);
      } catch (error) {
        // TODO: Handle error
      }
    }
  };

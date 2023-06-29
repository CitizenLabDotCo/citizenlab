// api
import { BasketIdeaAttributes, IBasketData } from 'api/baskets/types';
import { updateBasket } from 'api/baskets/useUpdateBasket';
import { addBasket } from 'api/baskets/useAddBasket';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from 'containers/ProjectsShowPage/shared/pb/tracks';

// utils
import { isNil, capitalizeParticipationContextType } from 'utils/helperUtils';
import streams from 'utils/streams';

// typings
import { IParticipationContextType } from 'typings';

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
    if (!isNil(basket)) {
      const basketIdeaIds = basket.relationships.ideas.data.map(
        (idea) => idea.id
      );
      const isInBasket = basketIdeaIds.includes(ideaId);

      let newIdeas: string[] = [];

      if (isInBasket) {
        newIdeas = basket.relationships.ideas.data
          .filter((basketIdea) => basketIdea.id !== ideaId)
          .map((basketIdea) => basketIdea.id);
      } else {
        newIdeas = [
          ...basket.relationships.ideas.data.map((basketIdea) => basketIdea.id),
          ideaId,
        ];
      }

      try {
        const basketIdeasAttributes: BasketIdeaAttributes = newIdeas.map(
          (ideaId) => ({
            idea_id: ideaId,
          })
        );

        await updateBasket({
          id: basket.id,
          baskets_ideas_attributes: basketIdeasAttributes,
          submitted: false,
        });
        trackEventByName(tracks.ideaAddedToBasket);
      } catch (error) {
        streams.fetchAllWith({ dataId: [basket.id] });
      }
    } else {
      await addBasket({
        participation_context_id: participationContextId,
        participation_context_type: capitalizeParticipationContextType(
          participationContextType
        ),
        baskets_ideas_attributes: [{ idea_id: ideaId }],
      });
      trackEventByName(tracks.basketCreated);
    }
  };

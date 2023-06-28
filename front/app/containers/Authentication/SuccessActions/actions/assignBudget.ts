// services
import { IBasketData } from 'api/baskets/types';
import useAddBasket from 'api/baskets/useAddBasket';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from 'containers/ProjectsShowPage/shared/pb/tracks';

// utils
import { isNil, capitalizeParticipationContextType } from 'utils/helperUtils';

// typings
import { IUserData } from 'api/users/types';
import { IParticipationContextType } from 'typings';
import useUpdateBasket from 'api/baskets/useUpdateBasket';

export interface AssignBudgetParams {
  ideaId: string;
  participationContextId: string;
  participationContextType: IParticipationContextType;
  basket: IBasketData | null | undefined;
  addBasket: ReturnType<typeof useAddBasket>['mutateAsync'];
  updateBasket: ReturnType<typeof useUpdateBasket>['mutateAsync'];
}

export const assignBudget =
  ({
    ideaId,
    participationContextId,
    participationContextType,
    basket,
    addBasket,
    updateBasket,
  }: AssignBudgetParams) =>
  async (authUser: IUserData) => {
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

      await updateBasket({
        id: basket.id,
        user_id: authUser.id,
        participation_context_id: participationContextId,
        participation_context_type: capitalizeParticipationContextType(
          participationContextType
        ),
        idea_ids: newIdeas,
        submitted_at: null,
      });
      trackEventByName(tracks.ideaAddedToBasket);
    } else {
      await addBasket({
        user_id: authUser.id,
        participation_context_id: participationContextId,
        participation_context_type: capitalizeParticipationContextType(
          participationContextType
        ),
        idea_ids: [ideaId],
      });
      trackEventByName(tracks.basketCreated);
    }
  };

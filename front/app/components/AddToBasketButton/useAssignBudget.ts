import { useCallback, useState } from 'react';

// hooks
import useAuthUser from 'api/me/useAuthUser';
import useIdeaById from 'api/ideas/useIdeaById';
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import useBasket from 'api/baskets/useBasket';
import useAddBasket from 'api/baskets/useAddBasket';
import useBasketsIdeas from 'api/baskets_ideas/useBasketsIdeas';
import useDeleteBasketsIdea from 'api/baskets_ideas/useDeleteBasketsIdea';
import useAddBasketsIdea from 'api/baskets_ideas/useAddBasketsIdeas';

// utils
import { getParticipationContext } from './utils';
import { capitalizeParticipationContextType } from 'utils/helperUtils';
import eventEmitter from 'utils/eventEmitter';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from 'components/AddToBasketButton/tracks';

// constants
import { BUDGET_EXCEEDED_ERROR_EVENT } from 'components/ParticipationCTABars/VotingCTABar/events';

const timeout = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

interface Props {
  projectId: string;
  ideaId: string;
}

export const getCurrentBasketsIdeas = (basketsIdeas) => {
  const currentBasketsIdeas: {
    ideaId: string;
    basketsIdeaId: string;
    votes: number;
  }[] = [];

  basketsIdeas?.data.map((basketIdea) => {
    const ideaId = basketIdea.relationships.idea.data['id'];
    const basketsIdeaId = basketIdea.id;
    const votes = basketIdea.attributes.votes;
    currentBasketsIdeas.push({ ideaId, basketsIdeaId, votes });
  });

  return currentBasketsIdeas;
};

const useAssignBudget = ({ projectId, ideaId }: Props) => {
  const [processing, setProcessing] = useState(false);
  const { data: authUser } = useAuthUser();
  const { data: idea } = useIdeaById(ideaId);
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const { mutateAsync: addBasket } = useAddBasket(projectId);
  const participationContext = getParticipationContext(project, idea, phases);

  const { data: basket } = useBasket(
    participationContext?.relationships?.user_basket?.data?.id
  );
  const { data: basketsIdeas } = useBasketsIdeas(basket?.data.id);
  const { mutateAsync: addBasketsIdea } = useAddBasketsIdea();
  const { mutateAsync: deleteBasketsIdea } = useDeleteBasketsIdea();
  const currentBasketsIdeas = getCurrentBasketsIdeas(basketsIdeas);

  const assignBudget = useCallback(async () => {
    if (!authUser || !idea || !participationContext) {
      return;
    }

    const participationContextType =
      project?.data.attributes.process_type === 'continuous'
        ? 'project'
        : 'phase';

    const participationContextId = participationContext.id;
    const maxBudget = participationContext?.attributes.voting_max_total;
    const ideaBudget = idea?.data.attributes.budget;
    const basketTotal = basket?.data.attributes.total_votes;

    const done = async () => {
      await timeout(200);
      setProcessing(false);
    };

    setProcessing(true);

    if (basket) {
      const ideaInBasket = currentBasketsIdeas.find(
        (basketsIdea) => basketsIdea.ideaId === ideaId
      );
      let isPermitted = true;

      if (ideaInBasket) {
        try {
          deleteBasketsIdea({
            basketId: basket.data.id,
            basketIdeaId: ideaInBasket.basketsIdeaId,
          });
          trackEventByName(tracks.ideaRemovedFromBasket);
          done();
          return;
        } catch (error) {
          done();
        }
      } else {
        // If new idea causes exceeded budget, emit an error
        if (
          basketTotal &&
          maxBudget &&
          ideaBudget &&
          basketTotal + ideaBudget > maxBudget
        ) {
          eventEmitter.emit(BUDGET_EXCEEDED_ERROR_EVENT);
          isPermitted = false;
          setProcessing(false);
        }
      }

      if (isPermitted && basket && ideaBudget) {
        try {
          addBasketsIdea({
            basketId: basket.data.id,
            idea_id: ideaId,
            votes: ideaBudget,
          });
          done();

          trackEventByName(tracks.ideaAddedToBasket);
        } catch (error) {
          done();
        }
      }
    } else {
      try {
        await addBasket(
          {
            participation_context_id: participationContextId,
            participation_context_type: capitalizeParticipationContextType(
              participationContextType
            ),
          },
          {
            onSuccess: (data) => {
              if (ideaBudget) {
                addBasketsIdea({
                  basketId: data.data.id,
                  idea_id: ideaId,
                  votes: ideaBudget,
                });
              }
            },
          }
        );
        done();
        trackEventByName(tracks.basketCreated);
      } catch (error) {
        done();
      }
    }
  }, [
    authUser,
    idea,
    participationContext,
    project?.data.attributes.process_type,
    basket,
    currentBasketsIdeas,
    ideaId,
    deleteBasketsIdea,
    addBasketsIdea,
    addBasket,
  ]);

  return { assignBudget, processing };
};

export default useAssignBudget;

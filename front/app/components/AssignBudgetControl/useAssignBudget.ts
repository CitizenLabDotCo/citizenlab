import { useCallback, useState } from 'react';

// hooks
import useAuthUser from 'api/me/useAuthUser';
import useIdeaById from 'api/ideas/useIdeaById';
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import useBasket from 'api/baskets/useBasket';
import useUpdateBasket from 'api/baskets/useUpdateBasket';
import useAddBasket from 'api/baskets/useAddBasket';

// utils
import { getParticipationContext } from './utils';
import { capitalizeParticipationContextType } from 'utils/helperUtils';
import eventEmitter from 'utils/eventEmitter';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from 'containers/ProjectsShowPage/shared/pb/tracks';

// typings
import { BasketIdeaAttributes } from 'api/baskets/types';

const timeout = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

interface Props {
  projectId: string;
  ideaId: string;
}

export const BUDGET_EXCEEDED_ERROR_EVENT = 'budgetExceededError';

const useAssignBudget = ({ projectId, ideaId }: Props) => {
  const [processing, setProcessing] = useState(false);
  const { data: authUser } = useAuthUser();
  const { data: idea } = useIdeaById(ideaId);
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const { mutateAsync: addBasket } = useAddBasket(projectId);
  const { mutateAsync: updateBasket } = useUpdateBasket();

  const participationContext = getParticipationContext(project, idea, phases);

  const { data: basket } = useBasket(
    participationContext?.relationships?.user_basket?.data?.id
  );

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
    const basketTotal = basket?.data.attributes.total_budget;

    const done = async () => {
      await timeout(200);
      setProcessing(false);
    };

    setProcessing(true);

    if (basket) {
      const basketIdeaIds = basket.data.relationships.ideas.data.map(
        (idea) => idea.id
      );
      const isInBasket = basketIdeaIds.includes(idea.data.id);
      let isPermitted = true;
      let newIdeas: string[] = [];

      if (isInBasket) {
        newIdeas = basket.data.relationships.ideas.data
          .filter((basketIdea) => basketIdea.id !== idea.data.id)
          .map((basketIdea) => basketIdea.id);
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

        newIdeas = [
          ...basket.data.relationships.ideas.data.map(
            (basketIdea) => basketIdea.id
          ),
          idea.data.id,
        ];
      }

      if (isPermitted && basket) {
        try {
          const basketIdeasAttributes: BasketIdeaAttributes = newIdeas.map(
            (ideaId) => ({
              idea_id: ideaId,
            })
          );

          await updateBasket({
            id: basket.data.id,
            user_id: authUser.data.id,
            participation_context_id: participationContextId,
            participation_context_type: capitalizeParticipationContextType(
              participationContextType
            ),
            submitted_at: null,
            baskets_ideas_attributes: basketIdeasAttributes,
          });
          done();
          trackEventByName(tracks.ideaAddedToBasket);
        } catch (error) {
          done();
        }
      }
    } else {
      try {
        await addBasket({
          user_id: authUser.data.id,
          participation_context_id: participationContextId,
          participation_context_type: capitalizeParticipationContextType(
            participationContextType
          ),
          baskets_ideas_attributes: [{ idea_id: idea.data.id }],
        });
        done();
        trackEventByName(tracks.basketCreated);
      } catch (error) {
        done();
      }
    }
  }, [
    addBasket,
    updateBasket,
    authUser,
    basket,
    participationContext,
    idea,
    project,
  ]);

  return { assignBudget, processing };
};

export default useAssignBudget;

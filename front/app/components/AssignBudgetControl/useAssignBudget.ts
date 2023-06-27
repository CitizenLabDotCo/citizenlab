import { useCallback, useState } from 'react';

// hooks
import useAuthUser from 'api/me/useAuthUser';
import useIdeaById from 'api/ideas/useIdeaById';
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import useUpdateBasket from 'api/baskets/useUpdateBasket';
import useAddBasket from 'api/baskets/useAddBasket';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from 'containers/ProjectsShowPage/shared/pb/tracks';

const timeout = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

interface Props {
  projectId: string;
  ideaId: string;
}

const useAssignBudget = ({ projectId, ideaId }: Props) => {
  const [processing, setProcessing] = useState(false);
  const { data: authUser } = useAuthUser();
  const { data: idea } = useIdeaById(ideaId);
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const { mutateAsync: addBasket } = useAddBasket(projectId);
  const { mutateAsync: updateBasket } = useUpdateBasket();

  const assignBudget = useCallback(async () => {
    if (!authUser) {
      return;
    }

    const done = async () => {
      await timeout(200);
      setProcessing(false);
    };

    setProcessing(true);

    if (!isNilOrError(basket)) {
      const basketIdeaIds = basket.data.relationships.ideas.data.map(
        (idea) => idea.id
      );
      const isInBasket = basketIdeaIds.includes(ideaId);
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

      if (isPermitted && !isNilOrError(basket)) {
        try {
          await updateBasket({
            id: basket.data.id,
            user_id: authUser.data.id,
            participation_context_id: participationContextId,
            participation_context_type: capitalizeParticipationContextType(
              participationContextType
            ),
            idea_ids: newIdeas,
            submitted_at: null,
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
          idea_ids: [idea.data.id],
        });
        done();
        trackEventByName(tracks.basketCreated);
      } catch (error) {
        done();
      }
    }
  }, []);

  return { assignBudget, processing };
};

export default useAssignBudget;

// api
import { fetchProjectById } from 'api/projects/useProjectById';
import { fetchPhase } from 'api/phases/usePhase';
import { voteForIdea } from 'api/baskets_ideas/useVoteForIdea';
import { queryClient } from 'utils/cl-react-query/queryClient';
import basketsKeys from 'api/baskets/keys';
import basketsIdeasKeys from 'api/baskets_ideas/keys';
import { fetchBasketsIdeas } from 'api/baskets_ideas/useBasketsIdeas';
import projectsKeys from 'api/projects/keys';
import phasesKeys from 'api/phases/keys';

// utils
import { isIdeaInBasket } from 'components/VoteInputs/budgeting/AddToBasketButton/utils';
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

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
    updateSearchParams({ processing_vote: ideaId });

    const { data: participationContext } =
      participationContextType === 'project'
        ? await fetchProjectById({ id: participationContextId })
        : await fetchPhase({ phaseId: participationContextId });

    const basketId = participationContext.relationships.user_basket?.data?.id;

    // If no basket exists, the idea is definitely not in the basket
    // yet, so we can add it to the basket (the BE will create the
    // basket automatically)
    if (!basketId) {
      await addToBasketAndInvalidateCache({
        ideaId,
        votes,
        participationContext,
      });
      removeProcessing();
      return;
    }

    const basketsIdeas = await fetchBasketsIdeas({ basketId });
    const ideaInBasket = isIdeaInBasket(ideaId, basketsIdeas);

    // If a basket exists and the idea is already in the basket,
    // we do nothing
    if (ideaInBasket) {
      removeProcessing();
      return;
    }

    await addToBasketAndInvalidateCache({
      ideaId,
      votes,
      participationContext,
    });
    removeProcessing();
  };

const removeProcessing = () =>
  setTimeout(() => {
    removeSearchParams(['processing_vote']);
  }, 250);

const addToBasketAndInvalidateCache = async ({
  ideaId,
  votes,
  participationContext,
}: {
  ideaId: string;
  votes: number;
  participationContext: IProjectData | IPhaseData;
}) => {
  const project_id =
    participationContext.type === 'project'
      ? participationContext.id
      : participationContext.relationships.project.data.id;

  const phase_id =
    participationContext.type === 'phase' ? participationContext.id : undefined;

  const response = await voteForIdea({
    idea_id: ideaId,
    votes,
    project_id,
    phase_id,
  });

  const newBasketId = response.data.relationships.basket.data.id;

  const promises = [
    queryClient.invalidateQueries({
      queryKey: basketsKeys.item({ id: newBasketId }),
    }),
    queryClient.invalidateQueries({
      queryKey: basketsIdeasKeys.item({ basketId: newBasketId }),
    }),
  ];

  const continuousProject = participationContext.type === 'project';

  if (continuousProject) {
    promises.push(
      queryClient.invalidateQueries({
        queryKey: projectsKeys.item({ id: project_id }),
      })
    );
  }

  if (!continuousProject) {
    promises.push(
      queryClient.invalidateQueries({
        queryKey: phasesKeys.item({ phaseId: phase_id }),
      })
    );

    promises.push(
      queryClient.invalidateQueries({
        queryKey: phasesKeys.list({ projectId: project_id }),
      })
    );
  }

  await Promise.all(promises);
};

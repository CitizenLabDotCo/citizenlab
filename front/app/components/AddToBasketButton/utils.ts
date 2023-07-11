import { getLatestRelevantPhase } from 'api/phases/utils';

// typings
import { IIdea, IdeaVotingDisabledReason } from 'api/ideas/types';
import { IPhases } from 'api/phases/types';
import { IProject } from 'api/projects/types';
import {
  ActionDescriptorFutureEnabled,
  isFixableByAuthentication,
} from 'utils/actionDescriptors';
import { IBasket } from 'api/baskets/types';
import { IBasketsIdeas } from 'api/baskets_ideas/types';

export const getLatestRelevantParticipationContext = (
  project: IProject | undefined,
  idea: IIdea | undefined,
  phases: IPhases | undefined
) => {
  if (!project) return;
  if (project.data.attributes.process_type === 'continuous') {
    return project.data;
  }
  if (!phases) return;

  const ideaPhaseIds = idea?.data.relationships?.phases?.data?.map(
    (item) => item.id
  );

  if (!ideaPhaseIds) return;

  const ideaPhases = phases.data.filter((phase) =>
    ideaPhaseIds.includes(phase.id)
  );

  return getLatestRelevantPhase(ideaPhases);
};

export const isButtonEnabled = (
  basket: IBasket | undefined,
  actionDescriptor: ActionDescriptorFutureEnabled<IdeaVotingDisabledReason>
) => {
  const actionDisabledAndNotFixable =
    actionDescriptor.enabled === false &&
    !isFixableByAuthentication(actionDescriptor.disabled_reason);

  if (actionDisabledAndNotFixable) return false;

  if (basket === undefined) {
    return true;
  }

  const basketNotSubmittedYet = basket.data.attributes.submitted_at === null;
  return basketNotSubmittedYet;
};

export const isIdeaInBasket = (
  ideaId: string,
  basketsIdeas?: IBasketsIdeas
) => {
  if (!basketsIdeas) return false;

  for (const basketsIdea of basketsIdeas.data) {
    if (basketsIdea.relationships.idea.data.id === ideaId) return true;
  }

  return false;
};

import { getLatestRelevantPhase } from 'api/phases/utils';

// typings
import { IIdea } from 'api/ideas/types';
import { IPhases } from 'api/phases/types';
import { IProject } from 'api/projects/types';

export const getParticipationContext = (
  idea: IIdea | undefined,
  phases: IPhases | undefined,
  project: IProject | undefined
) => {
  if (!idea) return;
  const ideaPhaseIds = idea.data.relationships?.phases?.data?.map(
    (item) => item.id
  );

  // TODO
  const ideaPhases = phases
    ? phases.data.filter(
        (phase) =>
          Array.isArray(ideaPhaseIds) && ideaPhaseIds.includes(phase.id)
      )
    : undefined;

  const latestRelevantIdeaPhase = ideaPhases
    ? getLatestRelevantPhase(ideaPhases)
    : undefined;

  const participationContext = !phases
    ? project?.data
    : latestRelevantIdeaPhase;

  return participationContext;
};

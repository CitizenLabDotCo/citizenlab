import { getLatestRelevantPhase } from 'api/phases/utils';

// typings
import { IIdea } from 'api/ideas/types';
import { IPhases } from 'api/phases/types';
import { IProject } from 'api/projects/types';

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

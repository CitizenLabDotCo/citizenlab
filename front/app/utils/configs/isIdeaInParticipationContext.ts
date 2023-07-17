import { IIdea } from 'api/ideas/types';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

export const isIdeaInParticipationContext = (
  idea: IIdea,
  participationContext: IProjectData | IPhaseData
) => {
  if (participationContext.type === 'project') {
    return idea.data.relationships.project.data.id === participationContext.id;
  }

  return idea.data.relationships.phases.data.some(
    (phase) => participationContext.id === phase.id
  );
};

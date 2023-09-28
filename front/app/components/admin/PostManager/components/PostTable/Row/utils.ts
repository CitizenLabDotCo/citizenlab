import { IdeasPhase } from 'api/ideas_phases/types';

export const getRemovedPhase = (newPhases: string[], oldPhases: string[]) => {
  const newPhasesSet = new Set(newPhases);

  for (const oldPhase of oldPhases) {
    if (!newPhasesSet.has(oldPhase)) return oldPhase;
  }

  return;
};

export const ideaHasVotesInPhase = (
  phaseId: string,
  ideasPhases: (IdeasPhase | undefined)[]
) => {
  for (const ideasPhase of ideasPhases) {
    if (ideasPhase?.data.relationships.phase.data.id === phaseId) {
      const { votes_count } = ideasPhase.data.attributes;
      return votes_count > 0;
    }
  }

  return false;
};

import { IPhases, ParticipationMethod } from 'api/phases/types';

export const findSurveyPhaseId = (phases: IPhases) => {
  return findPhaseIdForParticipationMethod(phases, 'native_survey');
};

export const findIdeationPhaseId = (phases: IPhases) => {
  return findPhaseIdForParticipationMethod(phases, 'ideation');
};

const findPhaseIdForParticipationMethod = (
  phases: IPhases,
  participationMethod: ParticipationMethod
) => {
  for (const phase of phases.data) {
    if (phase.attributes.participation_method === participationMethod) {
      return phase.id;
    }
  }

  return undefined;
};

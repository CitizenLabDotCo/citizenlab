import { ParticipationMethod, TPhases } from 'api/phases/types';

import { isNilOrError } from 'utils/helperUtils';

export const hasEmbeddedSurvey = (phases: TPhases | null) => {
  let hasSurveyPhase = false;
  if (!isNilOrError(phases)) {
    phases.forEach((phase) => {
      if (phase.attributes.participation_method === 'survey') {
        hasSurveyPhase = true;
      }
    });
  }
  return hasSurveyPhase;
};

export const hasPhaseType = (
  phases: TPhases | null,
  phaseType: ParticipationMethod
) => {
  return (
    !isNilOrError(phases) &&
    phases.some((phase) => phase.attributes.participation_method === phaseType)
  );
};

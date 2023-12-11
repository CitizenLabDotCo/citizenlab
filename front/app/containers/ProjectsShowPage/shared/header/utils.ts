import { TPhases } from 'api/phases/types';
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

export const hasNativeSurvey = (phases: TPhases | null) => {
  let hasSurveyPhase = false;
  if (!isNilOrError(phases)) {
    phases.forEach((phase) => {
      if (phase.attributes.participation_method === 'native_survey') {
        hasSurveyPhase = true;
      }
    });
  }
  return hasSurveyPhase;
};

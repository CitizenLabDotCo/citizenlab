import { TPhases } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';
import { isNilOrError } from 'utils/helperUtils';

export const hasEmbeddedSurvey = (
  project: IProjectData,
  phases: TPhases | null
) => {
  let hasSurveyPhase = false;
  if (!isNilOrError(phases)) {
    phases.forEach((phase) => {
      if (phase.attributes.participation_method === 'survey') {
        hasSurveyPhase = true;
      }
    });
  }
  if (project.attributes.participation_method === 'survey') {
    hasSurveyPhase = true;
  }
  return hasSurveyPhase;
};

export const hasNativeSurvey = (
  project: IProjectData,
  phases: TPhases | null
) => {
  let hasSurveyPhase = false;
  if (!isNilOrError(phases)) {
    phases.forEach((phase) => {
      if (phase.attributes.participation_method === 'native_survey') {
        hasSurveyPhase = true;
      }
    });
  }
  if (project.attributes.participation_method === 'native_survey') {
    hasSurveyPhase = true;
  }
  return hasSurveyPhase;
};

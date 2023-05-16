import { IProjectData } from 'api/projects/types';
import { TPhases } from 'hooks/usePhases';
import { isNilOrError } from 'utils/helperUtils';

export const hasEmbeddedSurvey = (
  project: IProjectData,
  phases: TPhases | null
) => {
  let hasSurveyPhase = false;
  if (!isNilOrError(phases)) {
    phases.map((phase) => {
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

export const checkHasSurveyWithAnyonePermissions = (
  project: IProjectData | undefined,
  phases: TPhases | null
) => {
  const hasSurveyWithAnyonePermissions = true;

  return hasSurveyWithAnyonePermissions;
};

import { RouteType } from 'routes';
import { Multiloc } from 'typings';

import { UpdatePhaseObject, IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

type FormActionsConfig = {
  phaseId?: string;
  inputImporterLink: RouteType;
  heading?: Multiloc;
  postingEnabled: boolean;
  togglePostingEnabled: () => void;
};

export const getFormActionsConfig = (
  project: IProjectData,
  updatePhase: (phaseData: UpdatePhaseObject) => void,
  phase: IPhaseData
): FormActionsConfig => {
  return {
    phaseId: phase.id,
    inputImporterLink: `/admin/projects/${project.id}/phases/${phase.id}/input-importer`,
    heading: phase.attributes.title_multiloc,
    postingEnabled: phase.attributes.submission_enabled,
    togglePostingEnabled: () => {
      updatePhase({
        phaseId: phase.id,
        submission_enabled: !phase.attributes.submission_enabled,
      });
    },
  };
};

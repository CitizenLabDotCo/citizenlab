import { RouteType } from 'routes';
import { Multiloc } from 'typings';

import { UpdatePhaseObject, IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import { API_PATH } from 'containers/App/constants';

type FormActionsConfig = {
  phaseId?: string;
  editFormLink: RouteType;
  inputImporterLink: RouteType;
  downloadExcelLink: string;
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
    editFormLink: `/admin/projects/${project.id}/phases/${phase.id}/native-survey/edit`,
    inputImporterLink: `/admin/projects/${project.id}/phases/${phase.id}/input-importer`,
    downloadExcelLink: `${API_PATH}/phases/${phase.id}/importer/export_form/idea/xlsx`,
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

import { Multiloc } from 'typings';

import { UpdatePhaseObject, IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import { type TypedLinkProps } from 'utils/cl-router/Link';

type FormActionsConfig = {
  phaseId?: string;
  inputImporterLink: TypedLinkProps;
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
    inputImporterLink: {
      to: '/admin/projects/$projectId/phases/$phaseId/input-importer',
      params: { projectId: project.id, phaseId: phase.id },
    },
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

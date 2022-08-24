// Services
import { IPhaseData, updatePhase } from 'services/phases';
import { IProjectData, updateProject } from 'services/projects';

// Typings
import { Multiloc } from 'typings';

// Utils
import { isNilOrError } from 'utils/helperUtils';

type FormActionsConfig = {
  editFormLink: string;
  heading?: Multiloc;
  postingEnabled: boolean;
  toggleSubmissionsEnabled: () => void;
};

const getSurveyPhases = (phases: IPhaseData[] | Error | null | undefined) => {
  return !isNilOrError(phases)
    ? phases.filter(
        (phase) => phase.attributes.participation_method === 'native_survey'
      )
    : [];
};

export const getFormActionsConfig = (
  project: IProjectData,
  phases?: IPhaseData[] | Error | null | undefined
): FormActionsConfig[] => {
  const processType = project.attributes.process_type;
  if (processType === 'continuous') {
    return [
      {
        editFormLink: `/admin/projects/${project.id}/native-survey/edit`,
        postingEnabled: project?.attributes.posting_enabled,
        toggleSubmissionsEnabled: () => {
          updateProject(project.id, {
            posting_enabled: !project.attributes.posting_enabled,
          });
        },
      },
    ];
  }

  return getSurveyPhases(phases).map((phase) => ({
    editFormLink: `/admin/projects/${project.id}/phases/${phase.id}/native-survey/edit`,
    heading: phase.attributes.title_multiloc,
    postingEnabled: phase.attributes.posting_enabled,
    toggleSubmissionsEnabled: () => {
      updatePhase(phase.id, {
        posting_enabled: !phase.attributes.posting_enabled,
      });
    },
  }));
};

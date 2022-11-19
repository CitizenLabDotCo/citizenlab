// Services
import { IPhaseData, updatePhase } from 'services/phases';
import { IProjectData, updateProject } from 'services/projects';

// Typings
import { Multiloc } from 'typings';

// Utils
import { isNilOrError } from 'utils/helperUtils';

type FormActionsConfig = {
  phaseId?: string;
  editFormLink: string;
  viewFormLink: string;
  viewFormResults: string;
  heading?: Multiloc;
  postingEnabled: boolean;
  togglePostingEnabled: () => void;
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
        viewFormLink: `/projects/${project.attributes.slug}/ideas/new`,
        viewFormResults: `/admin/projects/${project.id}/native-survey/results`,
        postingEnabled: project.attributes.posting_enabled,
        togglePostingEnabled: () => {
          updateProject(project.id, {
            posting_enabled: !project.attributes.posting_enabled,
          });
        },
      },
    ];
  }

  return getSurveyPhases(phases).map((phase) => ({
    phaseId: phase.id,
    editFormLink: `/admin/projects/${project.id}/phases/${phase.id}/native-survey/edit`,
    viewFormLink: `/projects/${project.attributes.slug}/ideas/new?phase_id=${phase.id}`,
    viewFormResults: `/admin/projects/${project.id}/native-survey/results?phase_id=${phase.id}`,
    heading: phase.attributes.title_multiloc,
    postingEnabled: phase.attributes.posting_enabled,
    togglePostingEnabled: () => {
      updatePhase(phase.id, {
        posting_enabled: !phase.attributes.posting_enabled,
      });
    },
  }));
};

export const getIsPostingEnabled = (
  project: IProjectData,
  phase?: IPhaseData | Error | null | undefined
) => {
  if (!isNilOrError(phase)) {
    return phase.attributes.posting_enabled;
  }

  return project.attributes.posting_enabled;
};

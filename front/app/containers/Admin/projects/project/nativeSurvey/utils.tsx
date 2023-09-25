// api
import { updateProject } from 'api/projects/useUpdateProject';
import { IProjectData } from 'api/projects/types';

// typing
import { Multiloc } from 'typings';
import { IPhaseData, UpdatePhaseObject } from 'api/phases/types';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import { FormBuilderConfig } from 'components/FormBuilder/utils';

// intl
import messages from './messages';

export const nativeSurveyConfig: FormBuilderConfig = {
  formBuilderTitle: messages.survey2,
  viewFormLinkCopy: messages.viewSurvey2,
  toolboxTitle: messages.addSurveyContent2,
  formSavedSuccessMessage: messages.successMessage2,
  supportArticleLink: messages.supportArticleLink2,
  formEndPageLogicOption: messages.surveyEnd2,
  questionLogicHelperText: messages.questionLogicHelperText2,
  pagesLogicHelperText: messages.pagesLogicHelperText2,

  toolboxFieldsToExclude: [],
  formCustomFields: undefined,

  displayBuiltInFields: false,
  showStatusBadge: true,
  isLogicEnabled: true,
  alwaysShowCustomFields: true,
  isFormPhaseSpecific: true,
  groupingType: 'page',
};

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
  updatePhase: (phaseData: UpdatePhaseObject) => void,
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
          updateProject({
            projectId: project.id,
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
      updatePhase({
        phaseId: phase.id,
        posting_enabled: !phase.attributes.posting_enabled,
      });
    },
  }));
};

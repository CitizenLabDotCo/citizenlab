import React from 'react';

// services
import { IPhaseData, updatePhase } from 'services/phases';
import { IProjectData, updateProject } from 'services/projects';

// typing
import { Multiloc } from 'typings';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import DeleteFormResultsNotice from './DeleteFormResultsNotice';
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
  isEditPermittedAfterSubmissions: false,
  alwaysShowCustomFields: true,
  isFormPhaseSpecific: true,

  groupingType: 'page',
  getDeletionNotice: (projectId: string) => {
    return (
      <DeleteFormResultsNotice
        projectId={projectId}
        redirectToSurveyPage={true}
      />
    );
  },
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

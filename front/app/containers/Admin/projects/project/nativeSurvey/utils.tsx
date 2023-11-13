import React from 'react';

// api
import { IProjectData } from 'api/projects/types';

// typing
import { Multiloc } from 'typings';
import { IPhaseData, UpdatePhaseObject } from 'api/phases/types';

// utils
import { API_PATH } from 'containers/App/constants';

// components
import { FormBuilderConfig } from 'components/FormBuilder/utils';
import { Box } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';

// intl
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

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
  getWarningNotice: () => {
    return (
      <Box id="e2e-warning-notice" mb="20px">
        <Warning>
          <FormattedMessage {...messages.existingSubmissionsWarning} />
        </Warning>
      </Box>
    );
  },
};

type FormActionsConfig = {
  phaseId?: string;
  editFormLink: string;
  viewFormLink: string;
  offlineInputsLink: string;
  downloadExcelLink: string;
  downloadPdfLink: string;
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
    viewFormLink: `/projects/${project.attributes.slug}/ideas/new?phase_id=${phase.id}`,
    offlineInputsLink: `/admin/projects/${project.id}/phases/${phase.id}/offline-inputs`,
    downloadExcelLink: `${API_PATH}/phases/${phase.id}/import_ideas/example_xlsx`,
    downloadPdfLink: `${API_PATH}/phases/${phase.id}/custom_fields/to_pdf`,
    heading: phase.attributes.title_multiloc,
    postingEnabled: phase.attributes.posting_enabled,
    togglePostingEnabled: () => {
      updatePhase({
        phaseId: phase.id,
        posting_enabled: !phase.attributes.posting_enabled,
      });
    },
  };
};

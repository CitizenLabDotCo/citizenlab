import React from 'react';

// api
import { IProjectData } from 'api/projects/types';

// typing
import { Multiloc } from 'typings';
import { IPhaseData, UpdatePhaseObject } from 'api/phases/types';

// utils
import { API_PATH } from 'containers/App/constants';

// components
import {
  FormBuilderConfig,
  generateTempId,
} from 'components/FormBuilder/utils';
import { Box } from '@citizenlab/cl2-component-library';
import Warning from 'components/UI/Warning';

// intl
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

export const nativeSurveyConfig: FormBuilderConfig = {
  formBuilderTitle: messages.survey,
  viewFormLinkCopy: messages.viewSurvey,
  toolboxTitle: messages.addSurveyContent,
  formSavedSuccessMessage: messages.successMessage,
  supportArticleLink: messages.supportArticleLink,
  formEndPageLogicOption: messages.surveyEnd,
  questionLogicHelperText: messages.questionLogicHelperText,
  pagesLogicHelperText: messages.pagesLogicHelperText,

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

// TODO: JS - Get the correct types in here
// TODO: JS - Write tests for these functions

// If copying another form, reset IDs for fields and add temp-ids to options
export const resetCopiedForm = (customFields: any) => {
  // Set the field IDs
  let logicIdMap = { survey_end: 'survey_end' };
  const newFields = customFields?.map((field: any) => {
    const { id, ...newField } = field;
    newField.id = `${Math.floor(Date.now() * Math.random())}`;
    if (newField.input_type === 'page') {
      newField.temp_id = generateTempId();
      logicIdMap[id] = newField.temp_id;
    }
    if (newField.options?.length > 0) {
      newField.options = newField.options.map((option: any) => {
        const { id, ...newOption } = option;
        newOption.temp_id = generateTempId();
        logicIdMap[id] = newOption.temp_id;
        return newOption;
      });
    }
    return newField;
  });

  // Update the logic
  return newFields?.map((field: any) => {
    const { ...newField } = field;
    if (newField.logic?.rules) {
      const newRules = newField.logic.rules.map((rule: any) => {
        return {
          if: logicIdMap[rule.if],
          goto_page_id: logicIdMap[rule.goto_page_id],
        };
      });
      newField.logic = { rules: newRules };
    } else if (newField.logic) {
      newField.logic = {
        next_page_id: logicIdMap[newField.logic.next_page_id],
      };
    }
    return newField;
  });
};

// If the form is not yet persisted, set temp_ids for the options
export const resetOptionsIfNotPersisted = (
  customFields: any,
  formPersisted: boolean
) => {
  return formPersisted
    ? customFields
    : customFields?.map((field) => {
        if (field.options?.length > 0) {
          field.options = field.options.map((option) => {
            const { ...newOption } = option;
            delete newOption.id;
            newOption.temp_id = generateTempId();
            return newOption;
          });
        }
        return field;
      });
};

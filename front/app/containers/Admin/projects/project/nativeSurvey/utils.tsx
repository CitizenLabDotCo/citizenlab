import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';
import { Multiloc } from 'typings';

import {
  IFlatCustomField,
  IOptionsType,
  QuestionRuleType,
} from 'api/custom_fields/types';
import { IPhaseData, UpdatePhaseObject } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import { API_PATH } from 'containers/App/constants';

import {
  FormBuilderConfig,
  generateTempId,
} from 'components/FormBuilder/utils';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';

import AccessRightsNotice from './AccessRightsNotice';
import messages from './messages';

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
  getAccessRightsNotice: (projectId, phaseId, handleClose) => {
    return projectId && phaseId ? (
      <AccessRightsNotice
        projectId={projectId}
        phaseId={phaseId}
        handleClose={handleClose}
      />
    ) : null;
  },
};

type FormActionsConfig = {
  phaseId?: string;
  editFormLink: RouteType;
  viewFormLink: RouteType;
  offlineInputsLink: RouteType;
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

// If copying another form, reset IDs for fields and add temp-ids to options
export const resetCopiedForm = (customFields: IFlatCustomField[]) => {
  // Set the field IDs
  const logicIdMap = { survey_end: 'survey_end' };
  const newFields = customFields?.map((field: IFlatCustomField) => {
    const sourceFieldId = field.id;
    const { ...newField } = field;
    newField.id = `${Math.floor(Date.now() * Math.random())}`;
    if (newField.input_type === 'page') {
      newField.temp_id = generateTempId();
      logicIdMap[sourceFieldId] = newField.temp_id;
    }
    if (newField.options && newField.options.length > 0) {
      newField.options = newField.options?.map((option: IOptionsType) => {
        const sourceOptionId = option.id;
        const { ...newOption } = option;
        delete newOption.id;
        newOption.temp_id = generateTempId();
        if (sourceOptionId) logicIdMap[sourceOptionId] = newOption.temp_id;
        return newOption;
      });
    }
    return newField;
  });

  // Update the logic
  return newFields?.map((field: IFlatCustomField) => {
    const { ...newField } = field;
    if (newField.logic?.rules) {
      const newRules = newField.logic.rules.map((rule: QuestionRuleType) => {
        return {
          if: newField.input_type === 'select' ? logicIdMap[rule.if] : rule.if,
          goto_page_id: logicIdMap[rule.goto_page_id],
        };
      });
      newField.logic = { rules: newRules };
    } else if (newField.logic?.next_page_id) {
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
  if (formPersisted) return customFields;

  return customFields?.map((field: IFlatCustomField) => {
    if (field.options && field.options.length > 0) {
      field.options = field.options.map((option: IOptionsType) => {
        const { ...newOption } = option;
        delete newOption.id;
        newOption.temp_id = generateTempId();
        return newOption;
      });
    }
    return field;
  });
};

import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';
import { Multiloc } from 'typings';

import { IFlatCustomField, IOptionsType } from 'api/custom_fields/types';
import { IPhaseData, UpdatePhaseObject } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import { API_PATH } from 'containers/App/constants';

import { FormBuilderConfig } from 'components/FormBuilder/utils';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';

import AccessRightsNotice from './AccessRightsNotice';
import messages from './messages';

export const nativeSurveyConfig: FormBuilderConfig = {
  type: 'survey',
  formBuilderTitle: messages.survey,
  viewFormLinkCopy: messages.viewSurvey,
  toolboxTitle: messages.addSurveyContent,
  formSavedSuccessMessage: messages.successMessage,
  supportArticleLink: messages.supportArticleLink,
  formEndPageLogicOption: messages.surveyEnd,
  pagesLogicHelperText: messages.pagesLogicHelperText,

  toolboxFieldsToInclude: [
    // When adding new fields, confirm that the BE list matches
    'text',
    'multiline_text',
    'multiselect',
    'number',
    'select',
    'linear_scale',
    'ranking',
    'rating',
    'matrix_linear_scale',
    'sentiment_linear_scale',
    'page',
    'file_upload',
    'shapefile_upload',
    'title_multiloc',
    'html_multiloc',
    'files',
    'image_files',
    'topic_ids',
    'multiselect_image',
    'point',
    'line',
    'polygon',
  ],
  formCustomFields: undefined,

  displayBuiltInFields: false,
  builtInFields: [],
  showStatusBadge: true,
  isLogicEnabled: true,
  alwaysShowCustomFields: true,
  isFormPhaseSpecific: true,
  getWarningNotice: () => {
    return (
      <Box id="e2e-warning-notice" mb="16px">
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
  inputImporterLink: RouteType;
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
    inputImporterLink: `/admin/projects/${project.id}/phases/${phase.id}/input-importer`,
    downloadExcelLink: `${API_PATH}/phases/${phase.id}/importer/export_form/idea/xlsx`,
    downloadPdfLink: `${API_PATH}/phases/${phase.id}/importer/export_form/idea/pdf`,
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

// Remove the IDs from the options and matrix statements - for when the form is not persisted
export const clearOptionAndStatementIds = (
  customFields: IFlatCustomField[]
) => {
  return customFields.map((field: IFlatCustomField) => {
    const newField = { ...field };

    if (field.options && field.options.length > 0) {
      newField.options = field.options.map((option: IOptionsType) => {
        const { id: _id, ...optionWithoutId } = option;
        return { ...optionWithoutId };
      });
    }

    if (field.matrix_statements && field.matrix_statements.length > 0) {
      newField.matrix_statements = field.matrix_statements.map((statement) => {
        const { id: _id, ...statementWithoutId } = statement;
        return { ...statementWithoutId };
      });
    }

    return newField;
  });
};

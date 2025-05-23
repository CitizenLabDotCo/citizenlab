import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import {
  ICreateMatrixStatementsType,
  IFlatCustomField,
  IOptionsType,
} from 'api/custom_fields/types';

import UserFieldsInFormNotice from 'containers/Admin/projects/project/nativeSurvey/UserFieldsInFormNotice';

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
  getUserFieldsNotice: () => {
    return <UserFieldsInFormNotice />;
  },
};

// Remove the IDs from the options and matrix statements - for when the form is not persisted
export const clearOptionAndStatementIds = (
  customFields: IFlatCustomField[]
) => {
  return customFields.map((field: IFlatCustomField) => {
    const newField: IFlatCustomField = { ...field };

    if (field.options && field.options.length > 0) {
      newField.options = field.options.map((option: IOptionsType) => {
        const { id: _id, ...optionWithoutId } = option;
        return { ...optionWithoutId };
      });
    }

    if (field.matrix_statements && field.matrix_statements.length > 0) {
      const clearedStatements: ICreateMatrixStatementsType[] =
        field.matrix_statements.map((statement) => {
          const { id: _id, ...statementWithoutId } = statement;
          return { ...statementWithoutId };
        });

      // Luuc: This type situation is a total mess. We should
      // refactor this at some point.
      (newField as any).matrix_statements = clearedStatements;
    }

    return newField;
  });
};

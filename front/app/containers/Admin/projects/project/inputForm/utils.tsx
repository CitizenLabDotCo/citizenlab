import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { FormBuilderConfig } from 'components/FormBuilder/utils';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

// ideationConfig is also used for participation method 'voting'
export const ideationConfig: FormBuilderConfig = {
  type: 'input_form',
  formBuilderTitle: messages.inputForm,
  viewFormLinkCopy: messages.viewFormLinkCopy,
  formSavedSuccessMessage: messages.successMessage,
  toolboxTitle: messages.customToolboxTitle,

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
    'title_multiloc',
    'html_multiloc',
    'files',
    'image_files',
    'topic_ids',
    'multiselect_image',
    'page',
  ],
  displayBuiltInFields: true,
  builtInFields: [
    'title_multiloc',
    'body_multiloc',
    'proposed_budget',
    'topic_ids',
    'location_description',
    'idea_images_attributes',
    'idea_files_attributes',
  ],
  formCustomFields: undefined,

  showStatusBadge: false,
  isLogicEnabled: false,
  alwaysShowCustomFields: false,
  isFormPhaseSpecific: false,
  getWarningNotice: () => {
    return (
      <Box id="e2e-warning-notice" mb="16px">
        <Warning>
          <FormattedMessage {...messages.existingSubmissionsWarning} />
        </Warning>
      </Box>
    );
  },
};

export const proposalsConfig: FormBuilderConfig = {
  type: 'input_form',
  formBuilderTitle: messages.inputForm,
  viewFormLinkCopy: messages.viewFormLinkCopy,
  formSavedSuccessMessage: messages.successMessage,
  toolboxTitle: messages.customToolboxTitle,

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
    'title_multiloc',
    'html_multiloc',
    'files',
    'image_files',
    'topic_ids',
    'multiselect_image',
    'cosponsor_ids',
    'page',
  ],
  displayBuiltInFields: true,
  builtInFields: [
    'title_multiloc',
    'body_multiloc',
    'topic_ids',
    'location_description',
    'idea_images_attributes',
    'idea_files_attributes',
    'cosponsor_ids',
  ],
  formCustomFields: undefined,

  showStatusBadge: false,
  isLogicEnabled: false,
  alwaysShowCustomFields: false,
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
};

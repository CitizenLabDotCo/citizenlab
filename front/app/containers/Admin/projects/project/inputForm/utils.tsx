import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { FormBuilderConfig } from 'components/FormBuilder/utils';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

export const ideationConfig: FormBuilderConfig = {
  type: 'input_form',
  formBuilderTitle: messages.inputForm,
  viewFormLinkCopy: messages.viewFormLinkCopy,
  formSavedSuccessMessage: messages.successMessage,
  toolboxTitle: messages.customToolboxTitle,

  toolboxFieldsToExclude: [
    'file_upload',
    'shapefile_upload',
    'point',
    'line',
    'polygon',
    'cosponsor_ids',
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

  toolboxFieldsToExclude: [
    'file_upload',
    'shapefile_upload',
    'point',
    'line',
    'polygon',
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

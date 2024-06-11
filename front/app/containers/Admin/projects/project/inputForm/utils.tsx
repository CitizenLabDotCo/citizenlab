import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { FormBuilderConfig } from 'components/FormBuilder/utils';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

export const ideationConfig: FormBuilderConfig = {
  formBuilderTitle: messages.inputForm,
  viewFormLinkCopy: messages.viewFormLinkCopy,
  formSavedSuccessMessage: messages.successMessage,
  toolboxTitle: messages.customToolboxTitle,

  toolboxFieldsToExclude: ['page', 'file_upload', 'point'],
  displayBuiltInFields: true,
  formCustomFields: undefined,

  showStatusBadge: false,
  isLogicEnabled: false,
  alwaysShowCustomFields: false,
  isFormPhaseSpecific: false,

  groupingType: 'section',
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

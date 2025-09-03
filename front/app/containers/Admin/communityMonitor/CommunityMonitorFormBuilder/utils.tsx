import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import AccessRightsNotice from 'containers/Admin/projects/project/nativeSurvey/AccessRightsNotice';
import UserFieldsInFormNotice from 'containers/Admin/projects/project/nativeSurvey/UserFieldsInFormNotice';

import { FormBuilderConfig } from 'components/FormBuilder/utils';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

export const communityMonitorConfig: FormBuilderConfig = {
  type: 'survey',
  formBuilderTitle: messages.survey,
  viewFormLinkCopy: messages.viewSurvey,
  toolboxTitle: messages.addSurveyContent,
  formSavedSuccessMessage: messages.successMessage,
  supportArticleLink: messages.supportArticleLink,
  toolboxFieldsToInclude: ['page', 'sentiment_linear_scale'],
  formCustomFields: undefined,
  displayBuiltInFields: false,
  builtInFields: [],
  showStatusBadge: true,
  isLogicEnabled: false,
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
    return <UserFieldsInFormNotice communityMonitor={true} />;
  },
};

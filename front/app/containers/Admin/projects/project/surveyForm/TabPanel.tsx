import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import { RouteType } from 'routes';

import ImportResponsesSection from 'components/admin/FormSync/ImportResponsesSection';
import { SectionTitle, SectionDescription } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';

import DuplicateSurveyButtonWithModal from './DuplicateSurveyButtonWithModal';
import EditButtonWithWarningModal from './EditButtonWithWarningModal';
import messages from './messages';

const TabPanel = ({
  projectId,
  phaseId,
}: {
  projectId: string;
  phaseId: string;
}) => {
  const editFormLink: RouteType = `/admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`;

  return (
    <Box maxWidth="1200px">
      <SectionTitle data-cy="e2e-survey-form-title">
        <FormattedMessage {...messages.surveyForm} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.inputFormDescription} />
      </SectionDescription>
      <Box display="flex" alignItems="center" gap="8px">
        <EditButtonWithWarningModal
          phaseId={phaseId}
          editFormLink={editFormLink}
        />
        <DuplicateSurveyButtonWithModal
          phaseId={phaseId}
          editFormLink={editFormLink}
        />
      </Box>
      <ImportResponsesSection formType="survey" />
    </Box>
  );
};

export default () => {
  const { projectId, phaseId } = useParams();

  if (!projectId || !phaseId) {
    return null;
  }

  return <TabPanel projectId={projectId} phaseId={phaseId} />;
};

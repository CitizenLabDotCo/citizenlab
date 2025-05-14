import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import DownloadPDFButtonWithModal from 'components/admin/FormSync/DownloadPDFButtonWithModal';
import ExcelDownloadButton from 'components/admin/FormSync/ExcelDownloadButton';
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
  return (
    <Box maxWidth="700px">
      <SectionTitle data-cy="e2e-survey-form-title">
        <FormattedMessage {...messages.surveyForm} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.inputFormDescription} />
      </SectionDescription>
      <Box display="flex">
        <EditButtonWithWarningModal projectId={projectId} phaseId={phaseId} />
        <DuplicateSurveyButtonWithModal phaseId={phaseId} />
      </Box>
      <Box>
        <SubSectionTitle>
          <FormattedMessage {...messages.downloads} />
        </SubSectionTitle>
        <Box display="flex">
          <DownloadPDFButtonWithModal
            mr="8px"
            formType="survey"
            phaseId={phaseId}
          />
          <ExcelDownloadButton phaseId={phaseId} />
        </Box>
      </Box>
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

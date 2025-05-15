import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import { SectionTitle, SectionDescription } from 'components/admin/Section';
import DownloadPDFButtonWithModal from 'components/FormBuilder/components/FormBuilderTopBar/DownloadPDFButtonWithModal';
import ExcelDownloadButton from 'components/FormSync/ExcelDownloadButton';

import { FormattedMessage } from 'utils/cl-intl';

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
      <SectionTitle>
        <FormattedMessage {...messages.surveyForm} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.inputFormDescription} />
      </SectionDescription>
      <Box display="flex">
        <EditButtonWithWarningModal projectId={projectId} phaseId={phaseId} />
        <DownloadPDFButtonWithModal
          mr="8px"
          formType="survey"
          phaseId={phaseId}
        />
        <ExcelDownloadButton phaseId={phaseId} />
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

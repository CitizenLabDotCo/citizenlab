import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import { SectionTitle, SectionDescription } from 'components/admin/Section';
import DownloadPDFButtonWithModal from 'components/FormBuilder/components/FormBuilderTopBar/DownloadPDFButtonWithModal';
import ExcelDownloadButton from 'components/FormSync/ExcelDownloadButton';
import Button from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

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
        <Button
          mr="8px"
          linkTo={`/admin/projects/${projectId}/phases/${phaseId}/native-survey/edit`}
          width="auto"
          icon="edit"
          data-cy="e2e-edit-survey-form"
        >
          <FormattedMessage {...messages.editSurveyForm} />
        </Button>
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

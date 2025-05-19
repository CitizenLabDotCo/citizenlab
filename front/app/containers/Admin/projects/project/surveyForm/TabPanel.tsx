import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import { RouteType } from 'routes';

import {
  SectionTitle,
  SectionDescription,
  SubSectionTitle,
} from 'components/admin/Section';
import DownloadPDFButtonWithModal from 'components/FormBuilder/components/FormBuilderTopBar/DownloadPDFButtonWithModal';
import ExcelDownloadButton from 'components/FormSync/ExcelDownloadButton';

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
  const editFormLink: RouteType = `/admin/projects/${projectId}/phases/${phaseId}/native-survey/edit`;

  return (
    <Box maxWidth="700px">
      <SectionTitle>
        <FormattedMessage {...messages.surveyForm} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.inputFormDescription} />
      </SectionDescription>
      <Box display="flex" alignItems="center" gap="8px" mb="32px">
        <EditButtonWithWarningModal
          phaseId={phaseId}
          editFormLink={editFormLink}
        />
        <DuplicateSurveyButtonWithModal
          phaseId={phaseId}
          editFormLink={editFormLink}
        />
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

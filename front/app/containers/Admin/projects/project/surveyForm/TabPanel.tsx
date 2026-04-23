import React from 'react';

import { Box, Divider, Title } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import { RouteType } from 'routes';

import usePhase from 'api/phases/usePhase';

import ImportInputsSection from 'components/admin/FormSync/ImportInputsSection';
import { SectionTitle, SectionDescription } from 'components/admin/Section';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import { isPDFUploadSupported } from '../inputImporter/ReviewSection/utils';

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
  const { formatMessage } = useIntl();
  const editFormLink: RouteType = `/admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`;
  const { data: phase } = usePhase(phaseId);
  const participationMethod = phase?.data.attributes.participation_method;

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

      <Divider mb="28px" mt="32px" />
      <Title variant="h5" color="coolGrey600" fontWeight="semi-bold" mb="28px">
        {formatMessage(messages.importResponses).toUpperCase()}
      </Title>
      <ImportInputsSection
        formType="survey"
        pdfImportSupported={isPDFUploadSupported(participationMethod)}
      />
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

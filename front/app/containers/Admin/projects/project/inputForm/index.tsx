import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import usePhase from 'api/phases/usePhase';

import ImportInputsSection from 'components/admin/FormSync/ImportInputsSection';
import { SectionTitle, SectionDescription } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import { isPDFUploadSupported } from '../inputImporter/ReviewSection/utils';

import EditInputFormButton from './EditInputFormButton';
import messages from './messages';

export const InputForm = () => {
  const { projectId, phaseId } = useParams({
    from: '/$locale/admin/projects/$projectId/phases/$phaseId/form',
  });

  const { data: phase } = usePhase(phaseId);
  const participationMethod = phase?.data.attributes.participation_method;
  const editFormLink = `/admin/projects/${projectId}/phases/${phaseId}/form/edit`;

  return (
    <Box maxWidth="1200px">
      <SectionTitle>
        <FormattedMessage {...messages.inputForm} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.inputFormDescription} />
      </SectionDescription>
      <Box display="flex" flexDirection="row">
        <EditInputFormButton
          projectId={projectId}
          phaseId={phaseId}
          editFormLink={editFormLink}
        />
      </Box>
      <Box mt="28px">
        <ImportInputsSection
          formType="input_form"
          pdfImportSupported={isPDFUploadSupported(participationMethod)}
          showTitle
        />
      </Box>
    </Box>
  );
};

export default InputForm;

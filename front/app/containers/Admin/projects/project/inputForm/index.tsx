import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import usePhase from 'api/phases/usePhase';

import ImportInputsSection from 'components/admin/FormSync/ImportInputsSection';
import { SectionTitle, SectionDescription } from 'components/admin/Section';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import { isPDFUploadSupported } from '../inputImporter/ReviewSection/utils';

import messages from './messages';

export const InputForm = () => {
  const { projectId, phaseId } = useParams({
    from: '/$locale/admin/projects/$projectId/phases/$phaseId/form',
  });

  const { data: phase } = usePhase(phaseId);
  const participationMethod = phase?.data.attributes.participation_method;

  return (
    <Box maxWidth="1200px">
      <SectionTitle>
        <FormattedMessage {...messages.inputForm} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.inputFormDescription} />
      </SectionDescription>
      <Box display="flex" flexDirection="row">
        <ButtonWithLink
          mr="8px"
          linkTo={`/admin/projects/${projectId}/phases/${phaseId}/form/edit`}
          width="auto"
          icon="edit"
          data-cy="e2e-edit-input-form"
          buttonStyle="admin-dark"
        >
          <FormattedMessage {...messages.editInputForm} />
        </ButtonWithLink>
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

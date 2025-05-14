import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import { SectionTitle, SectionDescription } from 'components/admin/Section';
import DownloadPDFButtonWithModal from 'components/FormBuilder/components/FormBuilderTopBar/DownloadPDFButtonWithModal';
import ExcelDownloadButton from 'components/FormSync/ExcelDownloadButton';
import Button from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

export const InputForm = () => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  return (
    <>
      <Box gap="0px" flexWrap="wrap" width="100%" display="flex">
        <Box width="100%">
          <SectionTitle>
            <FormattedMessage {...messages.inputForm} />
          </SectionTitle>
          <SectionDescription style={{ maxWidth: '700px' }}>
            <FormattedMessage {...messages.inputFormDescription} />
          </SectionDescription>
        </Box>
        <Box display="flex" flexDirection="row">
          <Button
            mr="8px"
            linkTo={`/admin/projects/${projectId}/phases/${phaseId}/form/edit`}
            width="auto"
            icon="edit"
            data-cy="e2e-edit-input-form"
          >
            <FormattedMessage {...messages.editInputForm} />
          </Button>
          <DownloadPDFButtonWithModal
            mr="8px"
            formType="input_form"
            phaseId={phaseId}
          />
          <ExcelDownloadButton phaseId={phaseId} />
        </Box>
      </Box>
    </>
  );
};

export default InputForm;

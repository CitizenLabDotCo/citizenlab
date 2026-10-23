import React, { useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import { ParticipationMethod } from 'api/phases/types';

import { isPDFUploadSupported } from 'containers/Admin/projects/project/inputImporter/ReviewSection/utils';

import ImportInputsSection from 'components/admin/FormSync/ImportInputsSection';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';

import messages from '../messages';

interface Props {
  participationMethod: ParticipationMethod;
}

/** The printable PDF form and Excel template for collecting inputs offline. */
const OfflineFormsButton = ({ participationMethod }: Props) => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);
  const label = formatMessage(messages.paperAndExcelForms);
  const survey =
    getMethodConfig(participationMethod).formEditor === 'surveyEditor';

  return (
    <>
      <Button
        icon="download"
        buttonStyle="bo-secondary"
        width="100%"
        onClick={() => setOpened(true)}
      >
        {label}
      </Button>
      <Modal opened={opened} close={() => setOpened(false)} header={label}>
        <Box p="24px">
          <ImportInputsSection
            formType={survey ? 'survey' : 'input_form'}
            pdfImportSupported={isPDFUploadSupported(participationMethod)}
          />
        </Box>
      </Modal>
    </>
  );
};

export default OfflineFormsButton;

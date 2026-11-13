import React, { useState } from 'react';

import { Box, Button, ButtonProps } from '@citizenlab/cl2-component-library';

import { ParticipationMethod } from 'api/phases/types';

import { isPDFUploadSupported } from 'containers/Admin/projects/project/inputImporter/ReviewSection/utils';

import ImportInputsSection from 'components/admin/FormSync/ImportInputsSection';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';

import messages from '../messages';

interface Props {
  participationMethod: ParticipationMethod;
  label?: string;
  buttonProps?: Partial<ButtonProps>;
}

const OfflineFormsButton = ({
  participationMethod,
  label,
  buttonProps,
}: Props) => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);
  const title = label ?? formatMessage(messages.paperAndExcelForms);
  const survey =
    getMethodConfig(participationMethod).formEditor === 'surveyEditor';

  return (
    <>
      <Button
        icon="download"
        buttonStyle="bo-secondary"
        width="100%"
        onClick={() => setOpened(true)}
        {...buttonProps}
      >
        {title}
      </Button>
      <Modal opened={opened} close={() => setOpened(false)} header={title}>
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

import React, { useState } from 'react';

import Button from 'design-system/Button';
import Modal from 'design-system/Modal';
import 'design-system/tokens.css';

import { ParticipationMethod } from 'api/phases/types';

import { isPDFUploadSupported } from 'containers/Admin/projects/project/inputImporter/ReviewSection/utils';

import ImportInputsSection from 'components/admin/FormSync/ImportInputsSection';

import { useIntl } from 'utils/cl-intl';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';

import messages from '../messages';

interface Props {
  participationMethod: ParticipationMethod;
}

const OfflineFormsButton = ({ participationMethod }: Props) => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);
  const label = formatMessage(messages.paperAndExcelForms);
  const survey =
    getMethodConfig(participationMethod).formEditor === 'surveyEditor';

  return (
    <>
      <Button size={28} icon="download-16" onPress={() => setOpened(true)}>
        {label}
      </Button>
      <Modal isOpen={opened} onOpenChange={setOpened} title={label}>
        <ImportInputsSection
          formType={survey ? 'survey' : 'input_form'}
          pdfImportSupported={isPDFUploadSupported(participationMethod)}
        />
      </Modal>
    </>
  );
};

export default OfflineFormsButton;

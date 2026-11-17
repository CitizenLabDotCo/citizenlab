import React, { useState } from 'react';

import Button from 'design-system/Button';
import { IconName } from 'design-system/Icon';
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
  label?: string;
  /** The side column's action rows put their icon after the label. */
  trailingIcon?: IconName;
}

const OfflineFormsButton = ({
  participationMethod,
  label,
  trailingIcon,
}: Props) => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);
  const title = label ?? formatMessage(messages.paperAndExcelForms);
  const survey =
    getMethodConfig(participationMethod).formEditor === 'surveyEditor';

  return (
    <>
      {trailingIcon ? (
        <Button trailingIcon={trailingIcon} onPress={() => setOpened(true)}>
          {title}
        </Button>
      ) : (
        <Button size={28} icon="download-16" onPress={() => setOpened(true)}>
          {title}
        </Button>
      )}
      <Modal isOpen={opened} onOpenChange={setOpened} title={title}>
        <ImportInputsSection
          formType={survey ? 'survey' : 'input_form'}
          pdfImportSupported={isPDFUploadSupported(participationMethod)}
        />
      </Modal>
    </>
  );
};

export default OfflineFormsButton;

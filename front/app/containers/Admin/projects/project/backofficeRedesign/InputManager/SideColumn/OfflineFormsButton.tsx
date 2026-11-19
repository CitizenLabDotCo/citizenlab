import React, { useState } from 'react';

import Button from 'design-system/Button';
import Disclosure from 'design-system/Disclosure';
import { IconName } from 'design-system/Icon';
import Modal from 'design-system/Modal';

import { ParticipationMethod } from 'api/phases/types';

import { isPDFUploadSupported } from 'containers/Admin/projects/project/inputImporter/ReviewSection/utils';

import ImportInputsSection from 'components/admin/FormSync/ImportInputsSection';

import { useIntl } from 'utils/cl-intl';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';

import messages from '../messages';
import 'design-system/tokens.css';

interface Props {
  participationMethod: ParticipationMethod;
  label?: string;
  cardIcon?: IconName;
}

const OfflineFormsButton = ({
  participationMethod,
  label,
  cardIcon,
}: Props) => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);
  const title = label ?? formatMessage(messages.paperAndExcelForms);
  const survey =
    getMethodConfig(participationMethod).formEditor === 'surveyEditor';

  return (
    <>
      {cardIcon ? (
        <Disclosure
          header="button"
          title={title}
          actionIcon={cardIcon}
          onPress={() => setOpened(true)}
        />
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

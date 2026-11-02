import React, { useState } from 'react';

import { Button, bo } from '@citizenlab/cl2-component-library';

import useResetProject from 'api/projects/useResetProject';

import SettingsSection from 'containers/Admin/projects/project/backofficeRedesign/_shared/components/SettingsModal/SettingsSection';
import messages from 'containers/Admin/projects/project/backofficeRedesign/messages';
import dataMessages from 'containers/Admin/projects/project/data/messages';

import BoTypedDeleteConfirmationModal from 'components/UI/TypedDeleteConfirmationModal/BoTypedDeleteConfirmationModal';

import { useIntl } from 'utils/cl-intl';

interface Props {
  projectId: string;
}

const ResetSection = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const [confirmOpened, setConfirmOpened] = useState(false);
  const { mutate: resetProject, isPending } = useResetProject();

  return (
    <>
      <SettingsSection
        title={formatMessage(messages.settingsClearParticipationData)}
        description={formatMessage(dataMessages.dataDescription)}
        action={
          <Button
            buttonStyle="bo-secondary"
            width="auto"
            height={bo.buttonMedium.height}
            padding={bo.buttonMedium.padding}
            fontSize={bo.buttonMedium.fontSize}
            onClick={() => setConfirmOpened(true)}
            id="e2e-reset-participation-data"
          >
            {formatMessage(messages.settingsReset)}
          </Button>
        }
      />

      <BoTypedDeleteConfirmationModal
        opened={confirmOpened}
        onClose={() => setConfirmOpened(false)}
        onConfirm={() =>
          resetProject(projectId, {
            onSuccess: () => setConfirmOpened(false),
          })
        }
        title={messages.resetDataModalTitle}
        mainWarning={messages.resetDataModalDescription}
        confirmationWord={messages.resetDataConfirmationWord}
        deleteButtonText={messages.resetDataButton}
        isDeleting={isPending}
      />
    </>
  );
};

export default ResetSection;

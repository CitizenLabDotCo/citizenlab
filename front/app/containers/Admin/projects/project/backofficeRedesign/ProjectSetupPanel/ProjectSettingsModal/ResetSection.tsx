import React, { useState } from 'react';

import { Button, bo } from '@citizenlab/cl2-component-library';

import useResetProject from 'api/projects/useResetProject';

import dataMessages from 'containers/Admin/projects/project/data/messages';

import SettingsSection from 'components/UI/SettingsModal/SettingsSection';
import TypedDeleteConfirmationModal from 'components/UI/TypedDeleteConfirmationModal';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

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

      <TypedDeleteConfirmationModal
        variant="bo"
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

import React, { useState } from 'react';

import useResetProject from 'api/projects/useResetProject';

import SettingsSection from 'containers/Admin/projects/project/backofficeRedesign/_shared/components/SettingsModal/SettingsSection';
import dataMessages from 'containers/Admin/projects/project/data/messages';

import Button from 'design-system/Button';
import 'design-system/tokens.css';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import TypedConfirmationModal from './TypedConfirmationModal';

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
            variant="secondary"
            onPress={() => setConfirmOpened(true)}
            id="e2e-reset-participation-data"
          >
            {formatMessage(messages.settingsReset)}
          </Button>
        }
      />

      <TypedConfirmationModal
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

import React from 'react';

import messages from 'containers/Admin/projects/project/backofficeRedesign/messages';

import AlertDialog from 'design-system/AlertDialog';
import 'design-system/tokens.css';

import { useIntl } from 'utils/cl-intl';

interface Props {
  opened: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
}

const DiscardChangesModal = ({ opened, onKeepEditing, onDiscard }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <AlertDialog
      isOpen={opened}
      onOpenChange={(isOpen) => {
        if (!isOpen) onKeepEditing();
      }}
      title={formatMessage(messages.unsavedChangesTitle)}
      confirmLabel={formatMessage(messages.discardChanges)}
      onConfirm={onDiscard}
    >
      {formatMessage(messages.unsavedChangesDescription2)}
    </AlertDialog>
  );
};

export default DiscardChangesModal;

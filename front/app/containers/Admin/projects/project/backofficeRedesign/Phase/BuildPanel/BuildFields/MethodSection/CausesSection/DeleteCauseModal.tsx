import React from 'react';

import AlertDialog from 'design-system/AlertDialog';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  onConfirm: () => void;
  onClose: () => void;
}

const DeleteCauseModal = ({ onConfirm, onClose }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <AlertDialog
      isOpen
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      title={formatMessage(messages.deleteCauseTitle)}
      confirmLabel={formatMessage(messages.deleteCause)}
      onConfirm={() => {
        onConfirm();
        onClose();
      }}
    >
      {formatMessage(messages.deleteCauseDescription)}
    </AlertDialog>
  );
};

export default DeleteCauseModal;

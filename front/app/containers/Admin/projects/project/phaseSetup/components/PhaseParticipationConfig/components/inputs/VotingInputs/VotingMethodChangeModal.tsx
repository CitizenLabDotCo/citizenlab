import React from 'react';

import AlertDialog from 'design-system/AlertDialog';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import 'design-system/tokens.css';

interface Props {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const VotingMethodChangeModal = ({ opened, onClose, onConfirm }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <AlertDialog
      isOpen={opened}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      title={formatMessage(messages.changeVotingMethodTitle)}
      confirmLabel={formatMessage(messages.changeVotingMethodConfirm)}
      onConfirm={() => onConfirm()}
    >
      {formatMessage(messages.changeVotingMethodWarning)}
    </AlertDialog>
  );
};

export default VotingMethodChangeModal;

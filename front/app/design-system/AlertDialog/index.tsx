import React, { ReactNode } from 'react';

import { Modal as AriaModal, ModalOverlay } from 'react-aria-components';

import { useIntl } from 'utils/cl-intl';

import DialogLayout from '../Modal/DialogLayout';
import modalStyles from '../Modal/Modal.module.css';

import styles from './AlertDialog.module.css';
import messages from './messages';
import '../tokens.css';

type AlertDialogProps = {
  // The label of the action that opened it, e.g. "Delete project".
  title: ReactNode;
  // What is lost, and that it cannot be undone.
  children: ReactNode;
  confirmLabel: ReactNode;
  onConfirm: () => void;
  isPending?: boolean;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  confirmId?: string;
  confirmDataCy?: string;
};

// Only for a destructive action that cannot be undone. Focus starts on Cancel.
const AlertDialog = ({
  title,
  children,
  confirmLabel,
  onConfirm,
  isPending,
  isOpen,
  onOpenChange,
  confirmId,
  confirmDataCy,
}: AlertDialogProps) => {
  const { formatMessage } = useIntl();

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className={modalStyles.overlay}
    >
      <AriaModal className={`${modalStyles.modal} ${modalStyles.size440}`}>
        <DialogLayout
          role="alertdialog"
          title={title}
          primaryVariant="danger"
          primaryAction={{
            label: confirmLabel,
            onPress: onConfirm,
            isPending,
            id: confirmId,
            'data-cy': confirmDataCy,
          }}
          secondaryAction={{ label: formatMessage(messages.cancel) }}
          autoFocusSecondary
        >
          <p className={styles.text}>{children}</p>
        </DialogLayout>
      </AriaModal>
    </ModalOverlay>
  );
};

export default AlertDialog;

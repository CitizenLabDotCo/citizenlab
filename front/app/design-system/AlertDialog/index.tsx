import React, { ReactNode, useState } from 'react';

import { Modal as AriaModal, ModalOverlay, Text } from 'react-aria-components';

import { useIntl } from 'utils/cl-intl';

import DialogLayout from '../Modal/DialogLayout';
import modalStyles from '../Modal/Modal.module.css';
import TextField from '../TextField';

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
  // For what is hardest to undo: the action stays off until this word is typed.
  confirmationWord?: string;
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
  confirmationWord,
}: AlertDialogProps) => {
  const { formatMessage } = useIntl();
  const [typed, setTyped] = useState('');
  const confirmed =
    !confirmationWord ||
    typed.trim().toLocaleLowerCase() === confirmationWord.toLocaleLowerCase();

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) setTyped('');
        onOpenChange(open);
      }}
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
            isDisabled: !confirmed,
            id: confirmId,
            'data-cy': confirmDataCy,
          }}
          secondaryAction={{ label: formatMessage(messages.cancel) }}
          autoFocusSecondary
        >
          <Text slot="description" elementType="p" className={styles.text}>
            {children}
          </Text>
          {confirmationWord && (
            <div className={styles.confirmation}>
              <TextField
                size={32}
                label={formatMessage(messages.typeToConfirm, {
                  word: confirmationWord,
                })}
                value={typed}
                onChange={setTyped}
              />
            </div>
          )}
        </DialogLayout>
      </AriaModal>
    </ModalOverlay>
  );
};

export default AlertDialog;

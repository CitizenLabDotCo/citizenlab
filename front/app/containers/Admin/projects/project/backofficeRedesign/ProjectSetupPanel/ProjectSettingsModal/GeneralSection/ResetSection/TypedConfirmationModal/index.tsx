import React from 'react';

import { Controller } from 'react-hook-form';

import typedConfirmationMessages from 'components/UI/TypedDeleteConfirmationModal/messages';
import useTypedConfirmation from 'components/UI/TypedDeleteConfirmationModal/useTypedConfirmation';

import Button from 'design-system/Button';
import Modal from 'design-system/Modal';
import TextField from 'design-system/TextField';

import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';

import styles from './TypedConfirmationModal.module.css';
import 'design-system/tokens.css';

interface Props {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: MessageDescriptor;
  mainWarning: MessageDescriptor;
  confirmationWord: MessageDescriptor;
  deleteButtonText: MessageDescriptor;
  isDeleting?: boolean;
}

// Not an AlertDialog: its confirm button can't wait for the typed word, and
// its body holds text only.
const TypedConfirmationModal = ({
  opened,
  onClose,
  onConfirm,
  title,
  mainWarning,
  confirmationWord,
  deleteButtonText,
  isDeleting = false,
}: Props) => {
  const { formatMessage } = useIntl();
  const { methods, confirmationText, isConfirmationValid, onSubmit } =
    useTypedConfirmation({ opened, confirmationWord, isDeleting, onConfirm });

  return (
    <Modal
      isOpen={opened}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isDeleting) onClose();
      }}
      title={formatMessage(title)}
      size={440}
      showClose={false}
    >
      <form className={styles.form} onSubmit={onSubmit}>
        <p className={styles.warning}>{formatMessage(mainWarning)}</p>
        <Controller
          name="confirmation"
          control={methods.control}
          render={({ field }) => (
            <TextField
              label={
                <FormattedMessage
                  {...typedConfirmationMessages.typeToConfirmShort}
                  values={{
                    confirmationWord: (
                      <span className={styles.word}>{confirmationText}</span>
                    ),
                  }}
                />
              }
              value={field.value}
              onChange={field.onChange}
              isDisabled={isDeleting}
              autoFocus
              data-cy="typed-confirmation-input"
            />
          )}
        />
        <div className={styles.actions}>
          <Button variant="quiet" onPress={onClose} isDisabled={isDeleting}>
            {formatMessage(typedConfirmationMessages.cancel)}
          </Button>
          <Button
            variant="danger"
            type="submit"
            isDisabled={!isConfirmationValid || isDeleting}
            isPending={isDeleting}
            data-cy="typed-confirmation-delete-button"
          >
            {formatMessage(deleteButtonText)}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TypedConfirmationModal;

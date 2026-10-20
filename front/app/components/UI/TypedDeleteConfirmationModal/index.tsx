import React from 'react';

import {
  Box,
  Title,
  Text,
  Button,
  Input,
  colors,
  Icon,
} from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from './messages';
import useTypedConfirmation from './useTypedConfirmation';

export interface Props {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: MessageDescriptor;
  entityName?: string;
  mainWarning: MessageDescriptor;
  confirmationWord: MessageDescriptor;
  deleteButtonText: MessageDescriptor;
  isDeleting?: boolean;
}

const TypedDeleteConfirmationModal = ({
  opened,
  onClose,
  onConfirm,
  title,
  entityName,
  mainWarning,
  confirmationWord,
  deleteButtonText,
  isDeleting = false,
}: Props) => {
  const { formatMessage } = useIntl();
  const {
    inputValue,
    setInputValue,
    confirmationText,
    isConfirmationValid,
    handleConfirm,
    handleKeyDown,
  } = useTypedConfirmation({ opened, confirmationWord, isDeleting, onConfirm });

  return (
    <Modal
      opened={opened}
      close={onClose}
      width={500}
      closeOnClickOutside={!isDeleting}
      ariaLabelledBy="typed-delete-modal-title"
    >
      <Title id="typed-delete-modal-title" variant="h3" color="primary">
        {formatMessage(title)}
      </Title>

      <Box
        p="16px"
        bgColor={colors.red100}
        borderLeft={`4px solid ${colors.red600}`}
      >
        <Box display="flex" gap="12px">
          <Icon name="alert-circle" fill={colors.red600} width="48px" />
          <Box>
            <Text fontWeight="bold" mt="0" color="red600">
              {formatMessage(messages.warning)}
            </Text>
            <Text mb="0" color="red600">
              {formatMessage(mainWarning)}
            </Text>
          </Box>
        </Box>
      </Box>

      <Text color="primary" mb="8px">
        <FormattedMessage
          {...messages.typeToConfirm}
          values={{
            entityName: (
              <Text as="span" color="primary" fontWeight="bold">
                &ldquo;{entityName}&rdquo;
              </Text>
            ),
            confirmationWord: (
              <Text as="span" fontWeight="bold" color="red600">
                {confirmationText}
              </Text>
            ),
          }}
        />
      </Text>

      <Input
        type="text"
        value={inputValue}
        onChange={setInputValue}
        onKeyDown={handleKeyDown}
        placeholder={confirmationText}
        disabled={isDeleting}
        autoFocus
        data-cy="typed-confirmation-input"
      />

      <Box display="flex" gap="12px" mt="24px">
        <Button
          buttonStyle="secondary-outlined"
          onClick={onClose}
          disabled={isDeleting}
        >
          {formatMessage(messages.cancel)}
        </Button>
        <Button
          icon="delete"
          buttonStyle="delete"
          onClick={handleConfirm}
          disabled={!isConfirmationValid || isDeleting}
          processing={isDeleting}
          data-cy="typed-confirmation-delete-button"
        >
          {formatMessage(deleteButtonText)}
        </Button>
      </Box>
    </Modal>
  );
};

export default TypedDeleteConfirmationModal;

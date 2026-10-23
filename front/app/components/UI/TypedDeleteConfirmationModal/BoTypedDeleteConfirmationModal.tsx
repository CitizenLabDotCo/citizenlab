import React from 'react';

import {
  Box,
  Title,
  Text,
  Button,
  Input,
  colors,
  bo,
  Icon,
} from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from './messages';
import useTypedConfirmation from './useTypedConfirmation';

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

const BoTypedDeleteConfirmationModal = ({
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
      variant="bo"
      opened={opened}
      close={onClose}
      width={440}
      padding="24px"
      hideCloseButton
      closeOnClickOutside={!isDeleting}
      ariaLabelledBy="typed-delete-modal-title"
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        w="40px"
        h="40px"
        mb="16px"
        borderRadius={bo.borderRadius}
        bgColor={colors.red100}
      >
        <Icon name="alert-circle" fill={colors.red600} width="20px" />
      </Box>
      <Title
        id="typed-delete-modal-title"
        variant="h4"
        fontWeight="semi-bold"
        color="textPrimary"
        mt="0px"
        mb="8px"
      >
        {formatMessage(title)}
      </Title>
      <Text variant="boHelper" mt="0px" mb="20px">
        {formatMessage(mainWarning)}
      </Text>
      <Text variant="boHelper" mt="0px" mb="8px">
        <FormattedMessage
          {...messages.typeToConfirmShort}
          values={{
            confirmationWord: (
              <Text as="span" fontWeight="semi-bold" color="textPrimary">
                {confirmationText}
              </Text>
            ),
          }}
        />
      </Text>
      <Input
        variant="bo"
        type="text"
        ariaLabel={confirmationText}
        value={inputValue}
        onChange={setInputValue}
        onKeyDown={handleKeyDown}
        disabled={isDeleting}
        autoFocus
        data-cy="typed-confirmation-input"
      />
      <Box display="flex" justifyContent="flex-end" gap="8px" mt="20px">
        <Button
          buttonStyle="bo-text"
          width="auto"
          onClick={onClose}
          disabled={isDeleting}
        >
          {formatMessage(messages.cancel)}
        </Button>
        <Button
          buttonStyle="bo-delete"
          width="auto"
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

export default BoTypedDeleteConfirmationModal;

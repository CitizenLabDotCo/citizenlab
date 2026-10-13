import React, { useState, useEffect } from 'react';

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
  variant?: 'default' | 'bo';
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
  variant = 'default',
}: Props) => {
  const { formatMessage } = useIntl();
  const [inputValue, setInputValue] = useState('');

  const confirmationText = formatMessage(confirmationWord);
  const isConfirmationValid =
    inputValue.toLowerCase().trim() === confirmationText.toLowerCase().trim();

  // Reset input when modal opens/closes
  useEffect(() => {
    if (!opened) {
      setInputValue('');
    }
  }, [opened]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const handleConfirm = () => {
    if (isConfirmationValid && !isDeleting) {
      onConfirm();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && isConfirmationValid && !isDeleting) {
      onConfirm();
    }
  };

  if (variant === 'bo') {
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
          borderRadius="8px"
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
          onChange={handleInputChange}
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
  }

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
        onChange={handleInputChange}
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

import React, { useState, useCallback, useEffect } from 'react';

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
  mainWarning: MessageDescriptor;
  confirmationWord: MessageDescriptor;
  deleteButtonText: MessageDescriptor;
  isDeleting?: boolean;
  /** Optional test id for e2e tests */
  'data-testid'?: string;
}

const TypedConfirmationModal = ({
  opened,
  onClose,
  onConfirm,
  title,
  mainWarning,
  confirmationWord,
  deleteButtonText,
  isDeleting = false,
  'data-testid': dataTestId,
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

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleConfirm = useCallback(() => {
    if (isConfirmationValid && !isDeleting) {
      onConfirm();
    }
  }, [isConfirmationValid, isDeleting, onConfirm]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' && isConfirmationValid && !isDeleting) {
        handleConfirm();
      }
    },
    [isConfirmationValid, isDeleting, handleConfirm]
  );

  return (
    <Modal
      opened={opened}
      close={onClose}
      data-testid={dataTestId}
      width={500}
      closeOnClickOutside={!isDeleting}
    >
      <Title variant="h3" color="primary">
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
        data-testid="typed-confirmation-input"
      />

      <Box display="flex" gap="12px" mt="24px">
        <Button
          icon="delete"
          buttonStyle="delete"
          onClick={handleConfirm}
          disabled={!isConfirmationValid || isDeleting}
          processing={isDeleting}
          data-testid="typed-confirmation-delete-button"
        >
          {formatMessage(deleteButtonText)}
        </Button>
        <Button
          buttonStyle="secondary-outlined"
          onClick={onClose}
          disabled={isDeleting}
        >
          {formatMessage(messages.cancel)}
        </Button>
      </Box>
    </Modal>
  );
};

export default TypedConfirmationModal;

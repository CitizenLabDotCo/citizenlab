import { useState, useEffect, KeyboardEvent } from 'react';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

interface Params {
  opened: boolean;
  confirmationWord: MessageDescriptor;
  isDeleting: boolean;
  onConfirm: () => void;
}

const useTypedConfirmation = ({
  opened,
  confirmationWord,
  isDeleting,
  onConfirm,
}: Params) => {
  const { formatMessage } = useIntl();
  const [inputValue, setInputValue] = useState('');

  const confirmationText = formatMessage(confirmationWord);
  const isConfirmationValid =
    inputValue.toLowerCase().trim() === confirmationText.toLowerCase().trim();

  useEffect(() => {
    if (!opened) {
      setInputValue('');
    }
  }, [opened]);

  const handleConfirm = () => {
    if (isConfirmationValid && !isDeleting) {
      onConfirm();
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleConfirm();
    }
  };

  return {
    inputValue,
    setInputValue,
    confirmationText,
    isConfirmationValid,
    handleConfirm,
    handleKeyDown,
  };
};

export default useTypedConfirmation;

import { useEffect } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { object, string } from 'yup';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

interface Params {
  opened: boolean;
  confirmationWord: MessageDescriptor;
  isDeleting: boolean;
  onConfirm: () => void;
}

const normalize = (value: string | undefined) =>
  (value ?? '').trim().toLowerCase();

const useTypedConfirmation = ({
  opened,
  confirmationWord,
  isDeleting,
  onConfirm,
}: Params) => {
  const { formatMessage } = useIntl();
  const confirmationText = formatMessage(confirmationWord);

  // The disabled delete button is the only feedback, so the rule has no message.
  const schema = object({
    confirmation: string().test(
      'matches-confirmation-word',
      '',
      (value) => normalize(value) === normalize(confirmationText)
    ),
  });

  const methods = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: { confirmation: '' },
  });

  const { reset } = methods;

  useEffect(() => {
    if (!opened) {
      reset();
    }
  }, [opened, reset]);

  const onSubmit = methods.handleSubmit(() => {
    if (!isDeleting) {
      onConfirm();
    }
  });

  return {
    methods,
    confirmationText,
    isConfirmationValid: methods.formState.isValid,
    onSubmit,
  };
};

export default useTypedConfirmation;

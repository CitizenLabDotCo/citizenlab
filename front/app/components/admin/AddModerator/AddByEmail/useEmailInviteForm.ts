import { useMemo } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { string, object } from 'yup';

import authenticationMessages from 'containers/Authentication/steps/messages';

import { useIntl } from 'utils/cl-intl';
import {
  isCLErrorsWrapper,
  handleHookFormSubmissionError,
} from 'utils/errorUtils';
import { isValidEmail } from 'utils/validate';

type FormValues = {
  email: string;
};

const DEFAULT_VALUES: FormValues = {
  email: '',
};

// Validation, submit and server-error handling for inviting someone by email.
const useEmailInviteForm = (onSubmit: (email: string) => Promise<void>) => {
  const { formatMessage } = useIntl();

  const schema = useMemo(
    () =>
      object({
        email: string()
          .email(formatMessage(authenticationMessages.emailFormatError))
          .required(formatMessage(authenticationMessages.emailMissingError))
          .test(
            '',
            formatMessage(authenticationMessages.emailFormatError),
            isValidEmail
          ),
      }),
    [formatMessage]
  );

  const methods = useForm<FormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  const submit = methods.handleSubmit(async ({ email }: FormValues) => {
    try {
      await onSubmit(email);
      methods.reset(DEFAULT_VALUES);
    } catch (e) {
      if (isCLErrorsWrapper(e)) {
        handleHookFormSubmissionError(e, methods.setError);
      }
    }
  });

  return { methods, submit };
};

export default useEmailInviteForm;

import React, { useMemo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object } from 'yup';

import Input from 'components/HookForm/Input';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import {
  isCLErrorsWrapper,
  handleHookFormSubmissionError,
} from 'utils/errorUtils';
import { isValidEmail } from 'utils/validate';
import messages from 'containers/Authentication/steps/messages';

type FormValues = {
  email: string;
};

const DEFAULT_VALUES: Partial<FormValues> = {
  email: undefined,
};

interface Props {
  onSubmit: (email: string) => void;
}

const EmailForm = ({ onSubmit }: Props) => {
  const { formatMessage } = useIntl();

  const schema = useMemo(
    () =>
      object({
        email: string()
          .email(formatMessage(messages.emailFormatError))
          .required(formatMessage(messages.emailMissingError))
          .test('', formatMessage(messages.emailFormatError), isValidEmail),
      }),
    [formatMessage]
  );

  const methods = useForm<FormValues>({
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  const handleSubmit = async ({ email }: FormValues) => {
    try {
      await onSubmit(email);
    } catch (e) {
      if (isCLErrorsWrapper(e)) {
        handleHookFormSubmissionError(e, methods.setError);
        return;
      }
    }
  };

  const loading = methods.formState.isSubmitting;

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)}>
        <Box>
          <Input
            name="email"
            type="email"
            autocomplete="email"
            label={formatMessage(messages.email)}
          />
        </Box>
        <Box w="100%" display="flex" mt="32px">
          <ButtonWithLink
            type="submit"
            width="100%"
            disabled={loading}
            processing={loading}
          >
            {formatMessage(messages.continue)}
          </ButtonWithLink>
        </Box>
      </form>
    </FormProvider>
  );
};

export default EmailForm;

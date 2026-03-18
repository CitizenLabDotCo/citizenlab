import React, { useMemo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object } from 'yup';

import authenticationMessages from 'containers/Authentication/steps/messages';

import Input from 'components/HookForm/Input';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import {
  isCLErrorsWrapper,
  handleHookFormSubmissionError,
} from 'utils/errorUtils';
import { isValidEmail } from 'utils/validate';

import messages from './messages';

type FormValues = {
  email: string;
};

const DEFAULT_VALUES: FormValues = {
  email: '',
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

  const handleSubmit = async ({ email }: FormValues) => {
    try {
      await onSubmit(email);
      methods.reset({ email: '' });
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
        <Box display="flex" alignItems="center">
          <Box width="500px">
            <Input
              name="email"
              type="email"
              autocomplete="email"
              placeholder={formatMessage(messages.typeEmailToInviteManager)}
            />
          </Box>
          <ButtonWithLink
            type="submit"
            width="auto"
            disabled={loading || !methods.formState.isValid}
            processing={loading}
            icon="email"
            buttonStyle="admin-dark"
            ml="20px"
          >
            {formatMessage(messages.invite)}
          </ButtonWithLink>
        </Box>
      </form>
    </FormProvider>
  );
};

export default EmailForm;

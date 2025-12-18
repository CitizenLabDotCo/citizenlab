import React, { useMemo } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object } from 'yup';

import { SetError } from 'containers/Authentication/typings';

import Input from 'components/HookForm/Input';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import {
  isCLErrorsWrapper,
  handleHookFormSubmissionError,
} from 'utils/errorUtils';
import { isValidEmail } from 'utils/validate';

import sharedMessages from '../messages';

import { FormValues } from './types';

const DEFAULT_VALUES: Partial<FormValues> = {
  email: undefined,
};

interface Props {
  loading: boolean;
  topText: MessageDescriptor;
  setError: SetError;
  onSubmit: (email: string) => void;
}

const EmailForm = ({ loading, topText, setError, onSubmit }: Props) => {
  const { formatMessage } = useIntl();

  const schema = useMemo(
    () =>
      object({
        email: string()
          .email(formatMessage(sharedMessages.emailFormatError))
          .required(formatMessage(sharedMessages.emailMissingError))
          .test(
            '',
            formatMessage(sharedMessages.emailFormatError),
            isValidEmail
          ),
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

      setError('unknown');
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)}>
        <Text mt="0px" mb="32px" color="tenantText">
          {formatMessage(topText)}
        </Text>
        <Box data-cy="email-flow-start-email-input">
          <Input
            name="email"
            type="email"
            autocomplete="email"
            label={formatMessage(sharedMessages.email)}
          />
        </Box>
        <Box w="100%" display="flex" mt="32px">
          <ButtonWithLink
            dataCy="email-flow-start-continue-button"
            type="submit"
            width="100%"
            disabled={loading}
            processing={loading}
          >
            {formatMessage(sharedMessages.continue)}
          </ButtonWithLink>
        </Box>
      </form>
    </FormProvider>
  );
};

export default EmailForm;

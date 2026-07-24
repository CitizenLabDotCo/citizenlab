import React, { useMemo } from 'react';

import { Box, Text, Button } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object } from 'yup';

import { SetError, State } from 'containers/Authentication/typings';

import Input from 'components/HookForm/Input';

import { useIntl } from 'utils/cl-intl';
import {
  isCLErrorsWrapper,
  handleHookFormSubmissionError,
} from 'utils/errorUtils';
import { isValidPhoneNumber } from 'utils/validate';

import sharedMessages from '../messages';

import messages from './messages';
import { FormValues } from './types';

interface Props {
  state: State;
  loading: boolean;
  setError: SetError;
  onSubmit: (phone: string) => Promise<void>;
}

const Phone = ({ state, loading, setError, onSubmit }: Props) => {
  const { formatMessage } = useIntl();

  const schema = useMemo(
    () =>
      object({
        new_phone: string()
          .required(formatMessage(messages.phoneNumberMissingError))
          .test(
            '',
            formatMessage(messages.phoneNumberFormatError),
            isValidPhoneNumber
          ),
      }),
    [formatMessage]
  );

  const methods = useForm<FormValues>({
    mode: 'onSubmit',
    defaultValues: { new_phone: state.phone ?? undefined },
    resolver: yupResolver(schema),
    shouldFocusError: true,
  });

  const handleSubmit = async ({ new_phone }: FormValues) => {
    try {
      await onSubmit(new_phone);
    } catch (e) {
      if (isCLErrorsWrapper(e)) {
        handleHookFormSubmissionError(e, methods.setError);
        return;
      }

      setError('unknown');
    }
  };

  return (
    <Box>
      <FormProvider {...methods}>
        <form noValidate onSubmit={methods.handleSubmit(handleSubmit)}>
          <Text mt="0px" mb="32px" color="tenantText">
            {formatMessage(messages.enterYourPhoneNumber)}
          </Text>
          <Box data-cy="phone-number-input">
            <Input
              name="new_phone"
              type="tel"
              autocomplete="tel"
              label={formatMessage(messages.phoneNumber)}
              required
            />
          </Box>
          <Box w="100%" display="flex" mt="32px">
            <Button
              dataCy="phone-continue-button"
              type="submit"
              width="100%"
              disabled={loading}
              processing={loading}
            >
              {formatMessage(sharedMessages.continue)}
            </Button>
          </Box>
        </form>
      </FormProvider>
    </Box>
  );
};

export default Phone;

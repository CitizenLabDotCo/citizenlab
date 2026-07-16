import React, { useMemo } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object } from 'yup';

import useAuthUser from 'api/me/useAuthUser';

import { SetError } from 'containers/Authentication/typings';

import Input from 'components/HookForm/Input';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import {
  isCLErrorsWrapper,
  handleHookFormSubmissionError,
} from 'utils/errorUtils';
import { isValidPhoneNumber } from 'utils/validate';

import sharedMessages from '../messages';

import messages from './messages';
import { FormValues } from './types';

const DEFAULT_VALUES: Partial<FormValues> = {
  phone: undefined,
};

interface Props {
  loading: boolean;
  setError: SetError;
  onSubmit: (userId: string, phone: string) => void;
}

const Phone = ({ loading, setError, onSubmit }: Props) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();

  const schema = useMemo(
    () =>
      object({
        phone: string()
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
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
    shouldFocusError: true,
  });

  if (!authUser) return null;

  const handleSubmit = async ({ phone }: FormValues) => {
    try {
      await onSubmit(authUser.data.id, phone);
    } catch (e) {
      if (isCLErrorsWrapper(e)) {
        handleHookFormSubmissionError(e, methods.setError);
        return;
      }

      setError('unknown');
    }
  };

  return (
    <Box data-cy="phone-flow-start">
      <FormProvider {...methods}>
        <form noValidate onSubmit={methods.handleSubmit(handleSubmit)}>
          <Text mt="0px" mb="32px" color="tenantText">
            {formatMessage(messages.enterYourPhoneNumber)}
          </Text>
          <Box data-cy="phone-flow-start-phone-number-input">
            <Input
              name="phone"
              type="tel"
              autocomplete="tel"
              label={formatMessage(messages.phoneNumber)}
              required
            />
          </Box>
          <Box w="100%" display="flex" mt="32px">
            <ButtonWithLink
              dataCy="phone-flow-start-continue-button"
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
    </Box>
  );
};

export default Phone;

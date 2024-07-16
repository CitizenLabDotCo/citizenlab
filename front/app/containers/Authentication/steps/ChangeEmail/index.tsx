import React, { useMemo } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object } from 'yup';

import { SetError } from 'containers/Authentication/typings';

import Input from 'components/HookForm/Input';
import Button from 'components/UI/Button';

import { useIntl } from 'utils/cl-intl';
import {
  isCLErrorsWrapper,
  handleHookFormSubmissionError,
} from 'utils/errorUtils';

import TextButton from '../_components/TextButton';
import sharedMessages from '../messages';

import messages from './messages';

// errors

interface Props {
  loading: boolean;
  setError: SetError;
  onGoBack: () => void;
  onChangeEmail: (newEmail: string) => void;
}

interface FormValues {
  email: string;
}

const DEFAULT_VALUES: Partial<FormValues> = {
  email: undefined,
};

const ChangeEmail = ({ loading, setError, onGoBack, onChangeEmail }: Props) => {
  const { formatMessage } = useIntl();

  const schema = useMemo(
    () =>
      object({
        email: string()
          .email(formatMessage(sharedMessages.emailFormatError))
          .required(formatMessage(sharedMessages.emailMissingError)),
      }),
    [formatMessage]
  );

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  const handleSubmit = async ({ email }: FormValues) => {
    try {
      await onChangeEmail(email);
    } catch (e) {
      if (isCLErrorsWrapper(e)) {
        handleHookFormSubmissionError(e, methods.setError);
        return;
      }

      setError('unknown');
    }
  };

  return (
    <>
      <Text mt="0px" mb="32px" color="tenantText">
        {formatMessage(messages.enterNewEmail)}
      </Text>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <Box>
            <Input
              name="email"
              type="email"
              label={formatMessage(sharedMessages.email)}
            />
          </Box>
          <Box w="100%" display="flex" mt="32px">
            <Button
              type="submit"
              width="auto"
              processing={loading}
              disabled={loading}
            >
              {formatMessage(messages.sendEmailWithCode)}
            </Button>
          </Box>
        </form>
      </FormProvider>
      <Text mb="0px" mt="24px">
        {formatMessage(messages.foundYourCode)}{' '}
        <TextButton onClick={onGoBack}>
          {formatMessage(messages.goBack)}
        </TextButton>
      </Text>
    </>
  );
};

export default ChangeEmail;

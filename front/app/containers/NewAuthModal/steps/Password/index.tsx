import React, { useMemo } from 'react';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import sharedMessages from '../../messages';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object } from 'yup';
import PasswordInput from 'components/HookForm/PasswordInput';

// typings
import { Status } from '../../typings';

interface Props {
  status: Status;
  onSubmit: (password: string) => void;
}

interface FormValues {
  password: string;
}

const DEFAULT_VALUES: Partial<FormValues> = {
  password: undefined,
};

const Password = ({ status, onSubmit }: Props) => {
  const { formatMessage } = useIntl();
  const loading = status === 'pending';

  const schema = useMemo(
    () =>
      object({
        password: string().required(formatMessage(messages.noPasswordError)),
      }),
    [formatMessage]
  );

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  const handleSubmit = ({ password }: FormValues) => {
    onSubmit(password);
  };

  const email = 'henk@piet.com'; // TODO

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)}>
        <Text mt="0px" mb="32px">
          {formatMessage(messages.logInToYourAccount, { account: email })}
        </Text>
        <Box>
          <PasswordInput
            name="password"
            isLoginPasswordInput
            // label={formatMessage(messages.email)}
          />
        </Box>
        <Box w="100%" display="flex" mt="32px">
          <Button
            type="submit"
            width="auto"
            disabled={loading}
            processing={loading}
          >
            {formatMessage(sharedMessages.logIn)}
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

export default Password;

import React, { useMemo } from 'react';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import TextLink from '../components/TextLink';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import sharedMessages from '../../messages';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object, boolean } from 'yup';
import PasswordInput from 'components/HookForm/PasswordInput';
import Checkbox from 'components/HookForm/Checkbox';

// typings
import { Status } from '../../typings';

interface Props {
  status: Status;
  onSubmit: (
    email: string,
    password: string,
    rememberMe: boolean,
    tokenLifetime: number
  ) => void;
}

interface FormValues {
  password: string;
  rememberMe: boolean;
}

const DEFAULT_VALUES: Partial<FormValues> = {
  password: undefined,
  rememberMe: false,
};

const Password = ({ status, onSubmit }: Props) => {
  const { formatMessage } = useIntl();
  const loading = status === 'pending';

  const schema = useMemo(
    () =>
      object({
        password: string().required(formatMessage(messages.noPasswordError)),
        rememberMe: boolean(),
      }),
    [formatMessage]
  );

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  const email = 'henk@piet.com'; // TODO
  const tokenLifetime = 10; // TODO

  const handleSubmit = ({ password, rememberMe }: FormValues) => {
    onSubmit(email, password, rememberMe, tokenLifetime);
  };

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
            label={formatMessage(messages.password)}
          />
        </Box>
        <Box mt="28px">
          <Checkbox
            name="rememberMe"
            label={
              <Text mt="0" mb="0" mr="4px">
                {formatMessage(messages.rememberMe)}
              </Text>
            }
            labelTooltipText={formatMessage(messages.rememberMeTooltip)}
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
      <Box mt="32px">
        <TextLink to="/password-recovery">
          {formatMessage(messages.forgotPassword)}
        </TextLink>
      </Box>
    </FormProvider>
  );
};

export default Password;

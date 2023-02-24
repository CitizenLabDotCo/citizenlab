import React, { useMemo } from 'react';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';

// components
import { Box, Text, Icon } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import TextLink from '../components/TextLink';

// i18n
import { useIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import sharedMessages from '../../messages';

// styling
import { colors } from 'utils/styleUtils';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object, boolean } from 'yup';
import PasswordInput from 'components/HookForm/PasswordInput';
import Checkbox from 'components/HookForm/Checkbox';

// typings
import { Status } from '../../typings';
import { isNilOrError } from 'utils/helperUtils';

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
  const appConfiguration = useAppConfiguration();

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

  if (isNilOrError(appConfiguration)) return null;

  const email = 'henk@piet.com'; // TODO

  const handleSubmit = ({ password, rememberMe }: FormValues) => {
    const tokenLifetime =
      appConfiguration.attributes.settings.core
        .authentication_token_lifetime_in_days;

    onSubmit(email, password, rememberMe, tokenLifetime);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)}>
        <Text mt="0px" mb="32px">
          <Icon
            width="20px"
            height="20px"
            name="user-circle"
            fill={colors.textSecondary}
            mr="8px"
            transform="translate(0,-1)"
          />
          <FormattedMessage
            {...messages.logInToYourAccount}
            values={{
              account: <strong>{email}</strong>,
            }}
          />
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

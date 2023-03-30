import React from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// i18n
import { useIntl } from 'utils/cl-intl';
import sharedMessages from '../messages';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object, boolean } from 'yup';
import Input from 'components/HookForm/Input';
import PasswordInput from 'components/HookForm/PasswordInput';
import Checkbox from 'components/HookForm/Checkbox';

interface Props {
  onSubmit: (
    email: string,
    password: string,
    rememberMe: boolean,
    tokenLifetime: number
  ) => void;
}

interface FormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

const DEFAULT_VALUES: Partial<FormValues> = {
  email: undefined,
  password: undefined,
  rememberMe: false,
};

const EmailAndPassword = ({ onSubmit }: Props) => {
  const passwordLoginEnabled = useFeatureFlag({ name: 'password_login' });
  const { data: appConfiguration } = useAppConfiguration();

  const appConfigSettings = appConfiguration?.data.attributes.settings;
  const tokenLifetime =
    appConfigSettings?.core.authentication_token_lifetime_in_days;
  const phoneLoginEnabled = !!appConfigSettings?.password_login?.phone;

  const { formatMessage } = useIntl();

  const emailSchema = phoneLoginEnabled
    ? string() // TODO
    : string()
        .email(formatMessage(sharedMessages.emailFormatError))
        .required(formatMessage(sharedMessages.emailMissingError));

  const schema = object({
    email: emailSchema,
    password: string(), // TODO
    rememberMe: boolean(),
  });

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  if (!passwordLoginEnabled || tokenLifetime === undefined) return null;

  const handleSubmit = ({ email, password, rememberMe }: FormValues) => {
    onSubmit(email, password, rememberMe, tokenLifetime);
  };

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <Text mt="0px" mb="32px">
            {formatMessage(sharedMessages.enterYourEmailAddress)}
          </Text>
          <Box>
            <Input
              name="email"
              type="email"
              label={
                phoneLoginEnabled ? 'TODO' : formatMessage(sharedMessages.email)
              }
            />
          </Box>
          <Box>
            <PasswordInput
              name="password"
              isLoginPasswordInput
              label={formatMessage(sharedMessages.password)}
            />
          </Box>
          <Box mt="28px">
            <Checkbox
              name="rememberMe"
              label={
                <Text mt="0" mb="0" mr="4px">
                  {formatMessage(sharedMessages.rememberMe)}
                </Text>
              }
              labelTooltipText={formatMessage(sharedMessages.rememberMeTooltip)}
            />
          </Box>
          <Box w="100%" display="flex" mt="32px">
            <Button type="submit" width="100%">
              {formatMessage(sharedMessages.continue)}
            </Button>
          </Box>
        </form>
      </FormProvider>
    </>
  );
};

export default EmailAndPassword;

import React from 'react';

// hooks
// import useFeatureFlag from 'hooks/useFeatureFlag';
import useAnySSOEnabled from 'containers/NewAuthModal/useAnySSOEnabled';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useLocale from 'hooks/useLocale';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import TextLink from '../components/TextLink';
import TextButton from '../components/TextButton';

// i18n
import { useIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import sharedMessages from '../messages';
import containerMessages from '../../messages';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { DEFAULT_VALUES, getSchema, FormValues } from './form';
import Input from 'components/HookForm/Input';
import PasswordInput from 'components/HookForm/PasswordInput';
import Checkbox from 'components/HookForm/Checkbox';

// utils
import { isNilOrError } from 'utils/helperUtils';

// constants
import { DEFAULT_MINIMUM_PASSWORD_LENGTH } from 'components/UI/PasswordInput';

// typings
import { Parameters as CreateAccountParameters } from 'api/authentication/createAccountWithPassword';
import { Status } from 'containers/NewAuthModal/typings';

interface Props {
  status: Status;
  onSwitchFlow: () => void;
  onGoBack: () => void;
  onSubmit: (parameters: CreateAccountParameters) => void;
}

const EmailAndPasswordSignUp = ({
  status,
  onSwitchFlow,
  onGoBack,
  onSubmit,
}: Props) => {
  // const passwordLoginEnabled = useFeatureFlag({ name: 'password_login' });
  const anySSOEnabled = useAnySSOEnabled();
  const { data: appConfiguration } = useAppConfiguration();
  const locale = useLocale();
  const { formatMessage } = useIntl();

  const loading = status === 'pending';
  const appConfigSettings = appConfiguration?.data.attributes.settings;
  const phoneLoginEnabled = !!appConfigSettings?.password_login?.phone;
  const minimumPasswordLength =
    appConfigSettings?.password_login?.minimum_length ??
    DEFAULT_MINIMUM_PASSWORD_LENGTH;

  const schema = getSchema(
    phoneLoginEnabled,
    minimumPasswordLength,
    formatMessage
  );

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  if (isNilOrError(locale)) return null;

  const handleSubmit = ({
    first_name,
    last_name,
    email,
    password,
  }: FormValues) => {
    onSubmit({
      firstName: first_name,
      lastName: last_name,
      email,
      password,
      locale,
    });
  };

  return (
    <Box id="e2e-sign-in-email-password-container">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <Box>
            <Input
              name="email"
              id="email"
              type="email"
              autocomplete="email"
              label={
                phoneLoginEnabled
                  ? formatMessage(sharedMessages.emailOrPhone)
                  : formatMessage(sharedMessages.email)
              }
            />
          </Box>
          <Box mt="16px">
            <PasswordInput
              name="password"
              id="password"
              label={formatMessage(sharedMessages.password)}
              autocomplete="current-password"
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
            <Button
              type="submit"
              width="auto"
              disabled={loading}
              processing={loading}
              id="e2e-signin-password-submit-button"
            >
              {formatMessage(containerMessages.logIn)}
            </Button>
          </Box>
        </form>
        <Box mt="32px">
          <TextLink
            to="/password-recovery"
            className="e2e-password-recovery-link"
          >
            {formatMessage(sharedMessages.forgotPassword)}
          </TextLink>
        </Box>
        <Box mt="12px">
          {anySSOEnabled ? (
            <TextButton onClick={onGoBack} className="link">
              {formatMessage(messages.backToSignUpOptions)}
            </TextButton>
          ) : (
            <FormattedMessage
              {...messages.goToLogIn}
              values={{
                goToOtherFlowLink: (
                  <button
                    id="e2e-goto-signup"
                    onClick={onSwitchFlow}
                    className="link"
                  >
                    {formatMessage(containerMessages.logIn)}
                  </button>
                ),
              }}
            />
          )}
        </Box>
      </FormProvider>
    </Box>
  );
};

export default EmailAndPasswordSignUp;

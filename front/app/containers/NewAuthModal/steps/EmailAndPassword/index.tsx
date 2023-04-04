import React, { useEffect } from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import TextLink from '../components/TextLink';
import TextButton from '../components/TextButton';

// i18n
import { useIntl, FormattedMessage } from 'utils/cl-intl';
import sharedMessages from '../messages';
import messages from './messages';
import containerMessages from '../../messages';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object, boolean } from 'yup';
import Input from 'components/HookForm/Input';
import PasswordInput from 'components/HookForm/PasswordInput';
import Checkbox from 'components/HookForm/Checkbox';

// utils
import { isValidEmail, isValidPhoneNumber } from 'utils/validate';
import { trackEventByName } from 'utils/analytics';
import tracks from '../../tracks';

// typings
import { Status } from 'containers/NewAuthModal/typings';

interface Props {
  status: Status;
  onSubmit: (
    email: string,
    password: string,
    rememberMe: boolean,
    tokenLifetime: number
  ) => void;
  onGoBack: () => void;
  onSwitchFlow: () => void;
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

const EmailAndPassword = ({
  status,
  onSubmit,
  onGoBack,
  onSwitchFlow,
}: Props) => {
  const passwordLoginEnabled = useFeatureFlag({ name: 'password_login' });
  const googleLoginEnabled = useFeatureFlag({ name: 'google_login' });
  const facebookLoginEnabled = useFeatureFlag({ name: 'facebook_login' });
  const azureAdLoginEnabled = useFeatureFlag({ name: 'azure_ad_login' });
  const franceconnectLoginEnabled = useFeatureFlag({
    name: 'franceconnect_login',
  });
  const viennaCitizenLoginEnabled = useFeatureFlag({
    name: 'vienna_citizen_login',
  });

  const loading = status === 'pending';

  const anySSOProviderEnabled =
    googleLoginEnabled ||
    facebookLoginEnabled ||
    azureAdLoginEnabled ||
    franceconnectLoginEnabled ||
    viennaCitizenLoginEnabled;

  const { data: appConfiguration } = useAppConfiguration();

  const appConfigSettings = appConfiguration?.data.attributes.settings;
  const tokenLifetime =
    appConfigSettings?.core.authentication_token_lifetime_in_days;
  const phoneLoginEnabled = !!appConfigSettings?.password_login?.phone;

  const { formatMessage } = useIntl();

  const emailSchema = phoneLoginEnabled
    ? string()
        .required(formatMessage(messages.emailOrPhoneMissingError))
        .test('', formatMessage(messages.emailOrPhoneNumberError), (value) => {
          if (value === undefined) return false;
          return isValidEmail(value) || isValidPhoneNumber(value);
        })
    : string()
        .required(formatMessage(sharedMessages.emailMissingError))
        .email(formatMessage(sharedMessages.emailFormatError))
        .test('', formatMessage(sharedMessages.emailFormatError), isValidEmail);

  const schema = object({
    email: emailSchema,
    password: string().required(formatMessage(sharedMessages.noPasswordError)),
    rememberMe: boolean(),
  });

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    trackEventByName(tracks.signInEmailPasswordEntered);
    return () => trackEventByName(tracks.signInEmailPasswordExited);
  }, []);

  if (!passwordLoginEnabled || tokenLifetime === undefined) return null;

  const handleSubmit = ({ email, password, rememberMe }: FormValues) => {
    onSubmit(email, password, rememberMe, tokenLifetime);
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
                  ? formatMessage(messages.emailOrPhone)
                  : formatMessage(sharedMessages.email)
              }
            />
          </Box>
          <Box mt="16px">
            <PasswordInput
              name="password"
              id="password"
              isLoginPasswordInput
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
          {anySSOProviderEnabled ? (
            <TextButton
              id="e2e-login-options"
              onClick={onGoBack}
              className="link"
            >
              {formatMessage(messages.goBackToLoginOptions)}
            </TextButton>
          ) : (
            <FormattedMessage
              {...messages.goToSignUp}
              values={{
                goToOtherFlowLink: (
                  <button
                    id="e2e-goto-signup"
                    onClick={onSwitchFlow}
                    className="link"
                  >
                    {formatMessage(messages.signUp)}
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

export default EmailAndPassword;

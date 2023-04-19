import React, { useState, useEffect } from 'react';

// api
import getUserDataFromToken from 'api/authentication/getUserDataFromToken';

// hooks
import useAnySSOEnabled from 'containers/Authentication/useAnySSOEnabled';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useLocale from 'hooks/useLocale';
import useSteps from 'containers/Authentication/useSteps';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import TextButton from '../_components/TextButton';
import PoliciesMarkup from '../Policies/PoliciesMarkup';

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

// tracks
import tracks from '../../tracks';
import { trackEventByName } from 'utils/analytics';

// utils
import { isNilOrError } from 'utils/helperUtils';

// constants
import { DEFAULT_MINIMUM_PASSWORD_LENGTH } from 'components/UI/PasswordInput';

// typings
import { Parameters as CreateAccountParameters } from 'api/authentication/sign_up/createAccountWithPassword';
import { State, Status } from 'containers/Authentication/typings';

interface BaseProps {
  state: State;
  status: Status;
  onSwitchFlow: () => void;
  onGoBack: () => void;
  onSubmit: (parameters: CreateAccountParameters) => void;
}

interface Props extends BaseProps {
  initialFormValues: Partial<FormValues>;
}

const EmailAndPasswordSignUp = ({
  state,
  status,
  initialFormValues,
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
    defaultValues: initialFormValues,
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    trackEventByName(tracks.signUpEmailPasswordStepEntered);
  }, []);

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
      isInvitation: !!state.token,
      token: state.token,
    });
  };

  return (
    <Box id="e2e-sign-in-email-password-container">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>
          <Box id="e2e-firstName-container">
            <Input
              name="first_name"
              id="firstName"
              type="text"
              autocomplete="given-name"
              label={formatMessage(sharedMessages.firstNamesLabel)}
            />
          </Box>
          <Box id="e2e-lastName-container" mt="16px">
            <Input
              name="last_name"
              id="lastName"
              type="text"
              autocomplete="family-name"
              label={formatMessage(sharedMessages.lastNameLabel)}
            />
          </Box>
          <Box id="e2e-email-container" mt="16px">
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
          <Box id="e2e-password-container" mt="16px">
            <PasswordInput
              name="password"
              id="password"
              label={formatMessage(sharedMessages.password)}
              autocomplete="current-password"
            />
          </Box>
          <Box mt="24px">
            <PoliciesMarkup />
          </Box>
          <Box w="100%" display="flex" mt="24px">
            <Button
              type="submit"
              width="auto"
              disabled={loading}
              processing={loading}
              id="e2e-signup-password-submit-button"
            >
              {formatMessage(sharedMessages.continue)}
            </Button>
          </Box>
        </form>
        <Box mt="32px">
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

interface WrapperProps extends BaseProps {
  onError: ReturnType<typeof useSteps>['setError'];
}

const EmailAndPasswordSignUpWrapper = ({
  state,
  onError,
  ...otherProps
}: WrapperProps) => {
  const { token } = state;
  const [prefilledValues, setPrefilledValues] =
    useState<Partial<FormValues> | null>(null);

  useEffect(() => {
    if (!token) return;
    if (prefilledValues) return;

    getUserDataFromToken(token)
      .then((response) => {
        setPrefilledValues({
          first_name: response.data.attributes.first_name ?? undefined,
          last_name: response.data.attributes.last_name ?? undefined,
          email: response.data.attributes.email ?? undefined,
        });
      })
      .catch(() => {
        onError('invitation_error');
      });
  }, [token, prefilledValues, onError]);

  if (token) {
    if (!prefilledValues) return null;

    return (
      <EmailAndPasswordSignUp
        {...otherProps}
        state={state}
        initialFormValues={prefilledValues}
      />
    );
  }

  return (
    <EmailAndPasswordSignUp
      {...otherProps}
      state={state}
      initialFormValues={DEFAULT_VALUES}
    />
  );
};

export default EmailAndPasswordSignUpWrapper;

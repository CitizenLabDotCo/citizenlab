import React, { useEffect } from 'react';

import { Box, Text, Label } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { SetError, State } from 'containers/Authentication/typings';
import useAnySSOEnabled from 'containers/Authentication/useAnySSOEnabled';
import { useForm, FormProvider } from 'react-hook-form';

import Input from 'components/HookForm/Input';
import PasswordInput from 'components/HookForm/PasswordInput';
import { StyledPasswordIconTooltip } from 'components/smallForm';
import Button from 'components/UI/Button';
import { DEFAULT_MINIMUM_PASSWORD_LENGTH } from 'components/UI/PasswordInput';

import { trackEventByName } from 'utils/analytics';
import { useIntl, FormattedMessage } from 'utils/cl-intl';
import {
  isCLErrorsWrapper,
  handleHookFormSubmissionError,
} from 'utils/errorUtils';
import { isNilOrError } from 'utils/helperUtils';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { Parameters as CreateAccountParameters } from 'api/authentication/sign_up/createAccountWithPassword';

import useLocale from 'hooks/useLocale';

import containerMessages from '../../messages';
import tracks from '../../tracks';
import TextButton from '../_components/TextButton';
import sharedMessages from '../messages';
import PoliciesMarkup from '../Policies/PoliciesMarkup';

import { DEFAULT_VALUES, getSchema, FormValues } from './form';
import messages from './messages';

// errors

// tracks

interface Props {
  state: State;
  loading: boolean;
  setError: SetError;
  onSwitchFlow: () => void;
  onGoBack: () => void;
  onSubmit: (parameters: CreateAccountParameters) => void;
}

const EmailAndPasswordSignUp = ({
  state,
  loading,
  setError,
  onSwitchFlow,
  onGoBack,
  onSubmit,
}: Props) => {
  const anySSOEnabled = useAnySSOEnabled();
  const { data: appConfiguration } = useAppConfiguration();
  const locale = useLocale();
  const { formatMessage } = useIntl();

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
    defaultValues: { ...DEFAULT_VALUES, ...state.prefilledBuiltInFields },
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    trackEventByName(tracks.signUpEmailPasswordStepEntered);
  }, []);

  if (isNilOrError(locale)) return null;

  const handleSubmit = async ({
    first_name,
    last_name,
    email,
    password,
  }: FormValues) => {
    try {
      await onSubmit({
        firstName: first_name,
        lastName: last_name,
        email,
        password,
        locale,
        isInvitation: !!state.token,
        token: state.token,
      });
    } catch (e) {
      if (isCLErrorsWrapper(e)) {
        handleHookFormSubmissionError(e, methods.setError);
        return;
      }

      setError('account_creation_failed');
    }
  };

  return (
    <Box id="e2e-sign-up-email-password-container">
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
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Label>
                <span>{formatMessage(sharedMessages.password)}</span>
              </Label>
              <StyledPasswordIconTooltip />
            </Box>
            <PasswordInput
              name="password"
              id="password"
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
        <Text mt="24px">
          {anySSOEnabled ? (
            <TextButton onClick={onGoBack} className="link">
              {formatMessage(messages.backToSignUpOptions)}
            </TextButton>
          ) : (
            <FormattedMessage
              {...messages.goToLogIn}
              values={{
                goToOtherFlowLink: (
                  <TextButton
                    id="e2e-goto-signup"
                    onClick={onSwitchFlow}
                    className="link"
                  >
                    {formatMessage(containerMessages.logIn)}
                  </TextButton>
                ),
              }}
            />
          )}
        </Text>
      </FormProvider>
    </Box>
  );
};

export default EmailAndPasswordSignUp;

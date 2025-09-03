import React, { useEffect } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { string, object, boolean } from 'yup';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { SetError } from 'containers/Authentication/typings';

import CheckboxWithLabel from 'components/HookForm/CheckboxWithLabel';
import Input from 'components/HookForm/Input';
import PasswordInput from 'components/HookForm/PasswordInput';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import {
  isCLErrorsWrapper,
  handleHookFormSubmissionError,
} from 'utils/errorUtils';
import { isValidEmail } from 'utils/validate';

import containerMessages from '../../messages';
import tracks from '../../tracks';
import TextLink from '../_components/TextLink';
import sharedMessages from '../messages';

interface Props {
  loading: boolean;
  setError: SetError;
  onSubmit: (
    email: string,
    password: string,
    rememberMe: boolean,
    tokenLifetime: number
  ) => void;
  closeModal: () => void;
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

const Form = ({ loading, setError, onSubmit, closeModal }: Props) => {
  const passwordLoginEnabled = useFeatureFlag({ name: 'password_login' });

  // To allow super admins to sign in with password when password login is disabled
  const [searchParams] = useSearchParams();
  const superAdmin = searchParams.get('super_admin') !== null;

  const { data: appConfiguration } = useAppConfiguration();

  const appConfigSettings = appConfiguration?.data.attributes.settings;
  const tokenLifetime =
    appConfigSettings?.core.authentication_token_lifetime_in_days;

  const { formatMessage } = useIntl();

  const emailSchema = string()
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
  }, []);

  if (!(passwordLoginEnabled || superAdmin) || tokenLifetime === undefined) {
    return null;
  }

  const handleSubmit = async ({ email, password, rememberMe }: FormValues) => {
    try {
      await onSubmit(email, password, rememberMe, tokenLifetime);
    } catch (e) {
      if (isCLErrorsWrapper(e)) {
        handleHookFormSubmissionError(e, methods.setError);
        return;
      }

      setError('sign_in_failed');
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)}>
        <Box id="e2e-email-container">
          <Input
            name="email"
            id="email"
            type="email"
            autocomplete="email"
            label={formatMessage(sharedMessages.email)}
          />
        </Box>
        <Box id="e2e-password-container" mt="16px">
          <PasswordInput
            name="password"
            id="password"
            isLoginPasswordInput
            label={formatMessage(sharedMessages.password)}
            autocomplete="current-password"
          />
        </Box>
        <Box mt="28px">
          <CheckboxWithLabel
            name="rememberMe"
            label={
              <Text mt="0" mb="0" mr="4px">
                {formatMessage(sharedMessages.rememberMe)}
              </Text>
            }
            labelTooltipText={formatMessage(sharedMessages.rememberMeTooltip)}
            ariaLabel={`${formatMessage(
              sharedMessages.rememberMe
            )}. ${formatMessage(sharedMessages.rememberMeTooltip)}`}
          />
        </Box>
        <Box w="100%" display="flex" mt="32px">
          <ButtonWithLink
            type="submit"
            width="auto"
            disabled={loading}
            processing={loading}
            id="e2e-signin-password-submit-button"
          >
            {formatMessage(containerMessages.logIn)}
          </ButtonWithLink>
        </Box>
      </form>
      <Box mt="32px">
        <TextLink
          to="/password-recovery"
          className="e2e-password-recovery-link"
          onClick={closeModal}
        >
          {formatMessage(sharedMessages.forgotPassword)}
        </TextLink>
      </Box>
    </FormProvider>
  );
};

export default Form;

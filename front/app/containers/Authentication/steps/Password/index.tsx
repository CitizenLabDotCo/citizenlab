import React, { useMemo } from 'react';

import { Box, Text, Icon, colors } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object, boolean } from 'yup';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import CheckboxWithLabel from 'components/HookForm/CheckboxWithLabel';
import PasswordInput from 'components/HookForm/PasswordInput';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl, FormattedMessage } from 'utils/cl-intl';
import {
  isCLErrorsWrapper,
  handleHookFormSubmissionError,
} from 'utils/errorUtils';
import { isNilOrError } from 'utils/helperUtils';

import containerMessages from '../../messages';
import { SetError, State } from '../../typings';
import TextLink from '../_components/TextLink';
import sharedMessages from '../messages';

import messages from './messages';

interface Props {
  state: State;
  loading: boolean;
  setError: SetError;
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

const Password = ({ state, loading, setError, onSubmit }: Props) => {
  const { formatMessage } = useIntl();
  const { data: appConfiguration } = useAppConfiguration();

  const schema = useMemo(
    () =>
      object({
        password: string().required(
          formatMessage(sharedMessages.noPasswordError)
        ),
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

  const { email } = state;
  if (email === null) return null;

  const handleSubmit = async ({ password, rememberMe }: FormValues) => {
    const tokenLifetime =
      appConfiguration.data.attributes.settings.core
        .authentication_token_lifetime_in_days;

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
              account: <strong>{state.email}</strong>,
            }}
          />
        </Text>
        <Box>
          <PasswordInput
            name="password"
            isLoginPasswordInput
            label={formatMessage(sharedMessages.password)}
          />
        </Box>
        <Box mt="28px">
          <CheckboxWithLabel
            name="rememberMe"
            label={
              <Text mt="0" mb="0" mr="4px" color="tenantText">
                {formatMessage(sharedMessages.rememberMe)}
              </Text>
            }
            labelTooltipText={formatMessage(sharedMessages.rememberMeTooltip)}
          />
        </Box>
        <Box w="100%" display="flex" mt="32px">
          <ButtonWithLink
            id="e2e-light-flow-password-submit"
            type="submit"
            width="auto"
            disabled={loading}
            processing={loading}
          >
            {formatMessage(containerMessages.logIn)}
          </ButtonWithLink>
        </Box>
      </form>
      <Box mt="32px">
        <TextLink to="/password-recovery">
          {formatMessage(sharedMessages.forgotPassword)}
        </TextLink>
      </Box>
    </FormProvider>
  );
};

export default Password;

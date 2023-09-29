import React, { useMemo } from 'react';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// components
import { Box, Text, Icon } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import TextLink from '../_components/TextLink';

// i18n
import { useIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import sharedMessages from '../messages';
import containerMessages from '../../messages';

// styling
import { colors } from 'utils/styleUtils';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object, boolean } from 'yup';
import PasswordInput from 'components/HookForm/PasswordInput';
import Checkbox from 'components/HookForm/Checkbox';

// errors
import {
  isCLErrorsWrapper,
  handleHookFormSubmissionError,
} from 'utils/errorUtils';

// typings
import { SetError, State } from '../../typings';
import { isNilOrError } from 'utils/helperUtils';

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
          <Checkbox
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
          <Button
            id="e2e-light-flow-password-submit"
            type="submit"
            width="auto"
            disabled={loading}
            processing={loading}
          >
            {formatMessage(containerMessages.logIn)}
          </Button>
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

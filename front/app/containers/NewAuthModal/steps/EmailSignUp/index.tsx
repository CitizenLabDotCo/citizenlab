import React, { useMemo } from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import SSOButtons from './SSOButtons';

// i18n
import { useIntl } from 'utils/cl-intl';
import sharedMessages from '../messages';
import messages from './messages';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object } from 'yup';
import Input from 'components/HookForm/Input';

// typings
import { SSOProvider } from 'services/singleSignOn';

interface Props {
  onSubmit: (email: string) => void;
  onSwitchToSSO: (ssoProvider: SSOProvider) => void;
}

interface FormValues {
  email: string;
}

const DEFAULT_VALUES: Partial<FormValues> = {
  email: undefined,
};

const EmailSignUp = ({ onSubmit, onSwitchToSSO }: Props) => {
  const passwordLoginEnabled = useFeatureFlag({ name: 'password_login' });

  const { formatMessage } = useIntl();

  const schema = useMemo(
    () =>
      object({
        email: string()
          .email(formatMessage(messages.emailFormatError))
          .required(formatMessage(messages.emailMissingError)),
      }),
    [formatMessage]
  );

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  const handleSubmit = ({ email }: FormValues) => {
    onSubmit(email);
  };

  return (
    <>
      {passwordLoginEnabled && (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleSubmit)}>
            <Text mt="0px" mb="32px">
              {formatMessage(messages.enterYourEmailAddress)}
            </Text>
            <Box>
              <Input
                name="email"
                type="email"
                label={formatMessage(messages.email)}
              />
            </Box>
            <Box w="100%" display="flex" mt="32px">
              <Button type="submit" width="100%">
                {formatMessage(sharedMessages.continue)}
              </Button>
            </Box>
          </form>
        </FormProvider>
      )}
      <SSOButtons onClickSSO={onSwitchToSSO} />
    </>
  );
};

export default EmailSignUp;

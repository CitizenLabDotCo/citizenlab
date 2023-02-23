import React, { useMemo } from 'react';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object } from 'yup';
import Input from 'components/HookForm/Input';

// typings
import { Status, ErrorCode } from '../typings';
import { SSOProvider } from 'services/singleSignOn';

// mocks
import { _setMockRequirements } from '../useSteps';

interface Props {
  status: Status;
  error: ErrorCode | null;
  onSubmit: (email: string) => void;
  onSwitchToSSO: (ssoProvider: SSOProvider) => void;
}

interface FormValues {
  email: string;
}

const DEFAULT_VALUES: Partial<FormValues> = {
  email: undefined,
};

const EmailSignUp = ({ status, onSubmit }: Props) => {
  const { formatMessage } = useIntl();
  const loading = status === 'pending';

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
    mode: 'onBlur',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  const handleSubmit = ({ email }: FormValues) => {
    _setMockRequirements({ authenticated: true });
    onSubmit(email);
  };

  return (
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
          <Button
            type="submit"
            width="auto"
            disabled={loading}
            processing={loading}
          >
            {formatMessage(messages.continue)}
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

export default EmailSignUp;

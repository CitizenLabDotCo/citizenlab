import React, { useMemo } from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import CodeSentMessage from 'containers/Authentication/SignUpIn/SignUpInModal/SignUp/ConfirmationSignupStep/CodeSentMessage';

// i18n
import { useIntl } from 'utils/cl-intl';
import oldMessages from 'containers/Authentication/SignUpIn/SignUpInModal/SignUp/ConfirmationSignupStep/messages';
import messages from './messages';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object } from 'yup';
import Input from 'components/HookForm/Input';

// typings
import { Status, ErrorCode } from '../../typings';

interface Props {
  status: Status;
  error: ErrorCode | null;
  onConfirm: (code: string) => void;
}

interface FormValues {
  code: string;
}

const DEFAULT_VALUES: Partial<FormValues> = {
  code: undefined,
};

const EmailConfirmation = ({ status, onConfirm }: Props) => {
  const { formatMessage } = useIntl();
  const loading = status === 'pending';

  const schema = useMemo(
    () =>
      object({
        code: string()
          .required(formatMessage(messages.codeMustHaveFourDigits))
          .matches(/^\d{4}$/, formatMessage(messages.codeMustHaveFourDigits)),
      }),
    [formatMessage]
  );

  const methods = useForm({
    mode: 'onBlur',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  const handleConfirm = ({ code }: FormValues) => {
    onConfirm(code);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleConfirm)}>
        <CodeSentMessage />
        <Box>
          <Input
            name="code"
            type="text"
            label={formatMessage(oldMessages.codeInput)}
          />
        </Box>
        <Box w="100%" display="flex" mt="32px">
          <Button
            type="submit"
            width="auto"
            disabled={loading}
            processing={loading}
          >
            {formatMessage(oldMessages.verifyAndContinue)}
          </Button>
        </Box>
      </form>
    </FormProvider>
  );
};

export default EmailConfirmation;

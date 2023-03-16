import React, { useMemo, useState, FormEvent } from 'react';

// services
import resendEmailConfirmationCode from 'api/authentication/resendEmailConfirmationCode';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import CodeSentMessage from 'containers/Authentication/SignUpIn/SignUpInModal/SignUp/ConfirmationSignupStep/CodeSentMessage';
import FooterNotes from 'containers/Authentication/SignUpIn/SignUpInModal/SignUp/ConfirmationSignupStep/FooterNotes';

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
import { State, Status, ErrorCode } from '../../typings';

interface Props {
  state: State;
  status: Status;
  error: ErrorCode | null;
  onConfirm: (code: string) => void;
  onChangeEmail: () => void;
}

interface FormValues {
  code: string;
}

const DEFAULT_VALUES: Partial<FormValues> = {
  code: undefined,
};

const EmailConfirmation = ({
  state,
  status,
  onConfirm,
  onChangeEmail,
}: Props) => {
  const [codeResent, setCodeResent] = useState(false);
  const [resendingCode, setResendingCode] = useState(false);

  const { formatMessage } = useIntl();
  const loading = status === 'pending' || resendingCode;

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
    setResendingCode(false);
    setCodeResent(false);
    onConfirm(code);
  };

  const handleResendCode = (e: FormEvent) => {
    e.preventDefault();
    setResendingCode(true);

    resendEmailConfirmationCode()
      .then(() => {
        setResendingCode(false);
        setCodeResent(true);
      })
      .catch((_errors) => {
        setResendingCode(false);
      });
  };

  const handleChangeEmail = (e: FormEvent) => {
    e.preventDefault();
    onChangeEmail();
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleConfirm)}>
        <CodeSentMessage email={state.email ?? undefined} />
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
        <Box mt="24px">
          <FooterNotes
            codeResent={codeResent}
            onResendCode={handleResendCode}
            onChangeEmail={handleChangeEmail}
          />
        </Box>
      </form>
    </FormProvider>
  );
};

export default EmailConfirmation;

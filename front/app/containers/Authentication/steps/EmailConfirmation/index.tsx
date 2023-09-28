import React, { useMemo, useState, FormEvent } from 'react';

// services
import resendEmailConfirmationCode from 'api/authentication/confirm_email/resendEmailConfirmationCode';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import CodeSentMessage from './CodeSentMessage';
import FooterNotes from './FooterNotes';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { string, object } from 'yup';
import Input from 'components/HookForm/Input';

// errors
import {
  isCLErrorsWrapper,
  handleHookFormSubmissionError,
} from 'utils/errorUtils';

// typings
import { State, SetError } from '../../typings';

interface Props {
  state: State;
  loading: boolean;
  setError: SetError;
  onConfirm: (code: string) => void;
  onChangeEmail?: () => void;
}

interface FormValues {
  code: string;
}

const DEFAULT_VALUES: Partial<FormValues> = {
  code: undefined,
};

const isWrongConfirmationCodeError = (e: any) => {
  return e?.code?.[0]?.error === 'invalid';
};

const EmailConfirmation = ({
  state,
  loading,
  setError,
  onConfirm,
  onChangeEmail,
}: Props) => {
  const [codeResent, setCodeResent] = useState(false);
  const [resendingCode, setResendingCode] = useState(false);

  const { formatMessage } = useIntl();
  const busy = loading || resendingCode;

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
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  const handleConfirm = async ({ code }: FormValues) => {
    setResendingCode(false);
    setCodeResent(false);

    try {
      await onConfirm(code);
    } catch (e) {
      if (isCLErrorsWrapper(e)) {
        handleHookFormSubmissionError(e, methods.setError);
        return;
      }

      if (isWrongConfirmationCodeError(e)) {
        setError('wrong_confirmation_code');
        return;
      }

      setError('unknown');
    }
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
    onChangeEmail && onChangeEmail();
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleConfirm)}>
        <Box mt="-8px">
          <CodeSentMessage email={state.email ?? undefined} />
        </Box>
        <Box>
          <Input
            name="code"
            type="text"
            label={formatMessage(messages.codeInput)}
          />
        </Box>
        <Box w="100%" display="flex" mt="32px">
          <Button
            id="e2e-verify-email-button"
            type="submit"
            width="auto"
            disabled={busy}
            processing={busy}
          >
            {formatMessage(messages.verifyAndContinue)}
          </Button>
        </Box>
        <Box mt="24px">
          <FooterNotes
            codeResent={codeResent}
            onResendCode={handleResendCode}
            onChangeEmail={onChangeEmail ? handleChangeEmail : undefined}
          />
        </Box>
      </form>
    </FormProvider>
  );
};

export default EmailConfirmation;

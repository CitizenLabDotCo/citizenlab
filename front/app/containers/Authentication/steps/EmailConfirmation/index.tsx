import React, { useMemo, useState, FormEvent } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object } from 'yup';

import Input from 'components/HookForm/Input';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import {
  isCLErrorsWrapper,
  handleHookFormSubmissionError,
} from 'utils/errorUtils';

import { State, SetError } from '../../typings';

import CodeSentMessage from './CodeSentMessage';
import FooterNotes from './FooterNotes';
import messages from './messages';

interface Props {
  state: State;
  loading: boolean;
  setError: SetError;
  onConfirm: (email: string, code: string) => void;
  onChangeEmail?: () => void;
  onResendCode: (email: string) => Promise<void>;
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
  onResendCode,
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

  const methods = useForm<FormValues>({
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  const email = state.email;
  if (!email) return null;

  const handleConfirm = async ({ code }: FormValues) => {
    setResendingCode(false);
    setCodeResent(false);

    try {
      await onConfirm(email, code);
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

    onResendCode(email)
      .then(() => {
        setResendingCode(false);
        setCodeResent(true);
      })
      .catch((_errors) => {
        setError('resending_code_failed');
        setResendingCode(false);
      });
  };

  const handleChangeEmail = onChangeEmail
    ? (e: FormEvent) => {
        e.preventDefault();
        onChangeEmail();
      }
    : undefined;

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleConfirm)}>
        <Box mt="-8px">
          <CodeSentMessage email={email} codeResent={codeResent} />
        </Box>
        <Box>
          <Input
            name="code"
            type="text"
            label={formatMessage(messages.codeInput)}
            maxCharCount={4}
          />
        </Box>
        <Box w="100%" display="flex" mt="32px">
          <ButtonWithLink
            id="e2e-verify-email-button"
            type="submit"
            width="auto"
            disabled={busy}
            processing={busy}
          >
            {formatMessage(messages.verifyAndContinue)}
          </ButtonWithLink>
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

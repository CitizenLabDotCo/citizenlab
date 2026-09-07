import React, { useMemo, useState, FormEvent } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object } from 'yup';

import { tooSoonRetryAfter } from 'api/authentication/confirm_phone/resendCooldown';

import Input from 'components/HookForm/Input';

import { useIntl } from 'utils/cl-intl';
import {
  isCLErrorsWrapper,
  handleHookFormSubmissionError,
} from 'utils/errorUtils';

import { SetError } from '../../typings';

import CodeSentMessage from './CodeSentMessage';
import FooterNotes from './FooterNotes';
import messages from './messages';
import useResendCooldown from './useResendCooldown';

interface Props {
  phone: string | null;
  loading: boolean;
  setError: SetError;
  onConfirm: (code: string) => void | Promise<void>;
  onChangePhone?: () => void;
  onResendCode: (phone: string) => Promise<void>;
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

const PhoneConfirmation = ({
  phone,
  loading,
  setError,
  onConfirm,
  onChangePhone,
  onResendCode,
}: Props) => {
  const [codeResent, setCodeResent] = useState(false);
  const [resendingCode, setResendingCode] = useState(false);
  const { secondsUntilResend, syncCooldown } = useResendCooldown();

  const { formatMessage } = useIntl();
  const busy = loading || resendingCode;

  const schema = useMemo(
    () =>
      object({
        code: string()
          .required(formatMessage(messages.codeMustHaveSixDigits))
          // 4 digits stays accepted until codes sent before the switch have expired.
          .matches(
            /^(?:\d{4}|\d{6})$/,
            formatMessage(messages.codeMustHaveSixDigits)
          ),
      }),
    [formatMessage]
  );

  const methods = useForm<FormValues>({
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  if (!phone) return null;

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
        setError('wrong_phone_confirmation_code');
        return;
      }

      setError('unknown');
    }
  };

  const handleResendCode = (e: FormEvent) => {
    e.preventDefault();
    setResendingCode(true);

    onResendCode(phone)
      .then(() => {
        setResendingCode(false);
        setCodeResent(true);
      })
      .catch((errors) => {
        // A refused resend is not worth an error message: the countdown that
        // comes with it already says what is going on.
        if (tooSoonRetryAfter(errors) === undefined) {
          setError('resending_code_failed');
        }

        setResendingCode(false);
      })
      .finally(syncCooldown);
  };

  const handleChangePhone = onChangePhone
    ? (e: FormEvent) => {
        e.preventDefault();
        onChangePhone();
      }
    : undefined;

  return (
    <FormProvider {...methods}>
      <form noValidate onSubmit={methods.handleSubmit(handleConfirm)}>
        <Box mt="-8px">
          <CodeSentMessage phoneNumber={phone} codeResent={codeResent} />
        </Box>
        <Box data-cy="phone-code-input">
          <Input
            name="code"
            type="text"
            label={formatMessage(messages.codeInput)}
            maxCharCount={6}
          />
        </Box>
        <Box w="100%" display="flex" mt="32px">
          <Button
            dataCy="phone-confirm-button"
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
            secondsUntilResend={secondsUntilResend}
            onResendCode={handleResendCode}
            onChangePhone={handleChangePhone}
          />
        </Box>
      </form>
    </FormProvider>
  );
};

export default PhoneConfirmation;

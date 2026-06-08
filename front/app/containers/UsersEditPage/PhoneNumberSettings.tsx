import React, { useState } from 'react';

import {
  Box,
  Button,
  Input,
  Text,
  Success,
} from '@citizenlab/cl2-component-library';

import { confirmPhoneConfirmationCode } from 'api/authentication/confirm_phone/confirmPhoneConfirmationCode';
import { requestPhoneConfirmationCode } from 'api/authentication/confirm_phone/requestPhoneConfirmationCode';
import useAuthUser from 'api/me/useAuthUser';

import Error from 'components/UI/Error';
import { FormSection, FormSectionTitle } from 'components/UI/FormComponents';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const PhoneNumberSettings = () => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'idle' | 'code'>('idle');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!authUser) return null;

  const attributes = authUser.data.attributes;
  const isVerified = !!attributes.phone_number_verified_at;

  const onRequest = async () => {
    setError(null);
    setSuccess(null);
    setProcessing(true);
    try {
      await requestPhoneConfirmationCode(phone || undefined);
      setStep('code');
      setSuccess(formatMessage(messages.phoneCodeSent));
    } catch {
      setError(formatMessage(messages.phoneError));
    } finally {
      setProcessing(false);
    }
  };

  const onConfirm = async () => {
    setError(null);
    setSuccess(null);
    setProcessing(true);
    try {
      await confirmPhoneConfirmationCode(code);
      setStep('idle');
      setCode('');
      setPhone('');
      setSuccess(formatMessage(messages.phoneVerified));
    } catch {
      setError(formatMessage(messages.phoneInvalidCode));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <FormSection>
      <FormSectionTitle
        message={messages.phoneTitle}
        subtitleMessage={messages.phoneSubtitle}
      />

      {isVerified && step === 'idle' && (
        <Text>
          {formatMessage(messages.phoneCurrent, {
            phone: attributes.phone_number ?? '',
          })}
        </Text>
      )}

      {success && (
        <Box mb="16px">
          <Success text={success} />
        </Box>
      )}
      {error && (
        <Box mb="16px">
          <Error text={error} />
        </Box>
      )}

      {step === 'idle' && (
        <Box>
          <Input
            type="text"
            value={phone}
            onChange={(value) => setPhone(value)}
            label={formatMessage(messages.phoneNumberLabel)}
            placeholder="+1..."
          />
          <Box mt="16px">
            <Button
              processing={processing}
              disabled={!phone}
              onClick={onRequest}
            >
              {formatMessage(messages.phoneSendCode)}
            </Button>
          </Box>
        </Box>
      )}

      {step === 'code' && (
        <Box>
          <Input
            type="text"
            value={code}
            onChange={(value) => setCode(value)}
            label={formatMessage(messages.phoneCodeLabel)}
            maxCharCount={4}
          />
          <Box mt="16px" display="flex" gap="10px">
            <Button
              processing={processing}
              disabled={!code}
              onClick={onConfirm}
            >
              {formatMessage(messages.phoneVerifyButton)}
            </Button>
            <Button
              buttonStyle="secondary-outlined"
              onClick={() => setStep('idle')}
            >
              {formatMessage(messages.phoneCancel)}
            </Button>
          </Box>
        </Box>
      )}
    </FormSection>
  );
};

export default PhoneNumberSettings;

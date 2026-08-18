import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { SetError } from 'containers/Authentication/typings';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import TextButton from '../_components/TextButton';

import EmailForm from './EmailForm';
import messages from './messages';
import PhoneForm from './PhoneForm';

interface Props {
  loading: boolean;
  topText: MessageDescriptor;
  setError: SetError;
  onSubmitEmail: (email: string) => void;
  onSubmitPhone: (phone: string) => void;
}

// The entry point of the password_login flow: the user identifies themselves
// with either their email address or, when the sms feature is enabled, their
// phone number.
const StartForm = ({
  loading,
  topText,
  setError,
  onSubmitEmail,
  onSubmitPhone,
}: Props) => {
  const { formatMessage } = useIntl();
  const smsFFEnabled = useFeatureFlag({ name: 'sms' });
  const smsLoginFFEnabled = useFeatureFlag({ name: 'sms_login' });
  const [showPhoneForm, setShowPhoneForm] = useState(false);

  const smsLoginEnabled = smsFFEnabled && smsLoginFFEnabled;

  if (!smsLoginEnabled) {
    return (
      <EmailForm
        loading={loading}
        topText={topText}
        setError={setError}
        onSubmit={onSubmitEmail}
      />
    );
  }

  return (
    <Box>
      {showPhoneForm ? (
        <PhoneForm
          loading={loading}
          setError={setError}
          onSubmit={onSubmitPhone}
        />
      ) : (
        <EmailForm
          loading={loading}
          topText={topText}
          setError={setError}
          onSubmit={onSubmitEmail}
        />
      )}
      <TextButton
        type="button"
        data-cy="flow-start-toggle-identifier"
        onClick={() => setShowPhoneForm((show) => !show)}
      >
        {formatMessage(
          showPhoneForm
            ? messages.useEmailInstead
            : messages.usePhoneNumberInstead
        )}
      </TextButton>
    </Box>
  );
};

export default StartForm;

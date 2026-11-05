import React, { useEffect, useState } from 'react';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import SessionExpiryModalBase from './SessionExpiryModalBase';

interface Props {
  initialSecondsRemaining: number;
  onDismiss: () => void;
  onClearSession: () => Promise<void>;
  onResetState: () => void;
}

const SessionExpiringSoonModal = ({
  initialSecondsRemaining,
  onDismiss,
  onClearSession,
  onResetState,
}: Props) => {
  const { formatMessage } = useIntl();
  const [countdown, setCountdown] = useState(initialSecondsRemaining);

  useEffect(() => {
    setCountdown(initialSecondsRemaining);

    const id = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(id);
  }, [initialSecondsRemaining]);

  const description =
    countdown <= 60
      ? formatMessage(messages.sessionExpiringSoonDescriptionSeconds, {
          seconds: countdown,
        })
      : formatMessage(messages.sessionExpiringSoonDescriptionMinutes, {
          minutes: Math.ceil(countdown / 60),
        });

  return (
    <SessionExpiryModalBase
      tabTitle={formatMessage(messages.tabTitleExpiringSoon)}
      title={formatMessage(messages.sessionExpiringSoonTitle)}
      description={description}
      dismissButtonLabel={formatMessage(messages.signOut)}
      onClose={onDismiss}
      onClearSession={onClearSession}
      onResetState={onResetState}
    />
  );
};

export default SessionExpiringSoonModal;

import React from 'react';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import SessionExpiryModalBase from './SessionExpiryModalBase';

interface Props {
  onClearSession: () => Promise<void>;
  onResetState: () => void;
}

const SessionExpiredModal = ({ onClearSession, onResetState }: Props) => {
  const { formatMessage } = useIntl();

  const handleStaySignedOut = async () => {
    await onClearSession();
    onResetState();
  };

  return (
    <SessionExpiryModalBase
      tabTitle={formatMessage(messages.tabTitleSignedOut)}
      title={formatMessage(messages.sessionExpiredTitle)}
      description={formatMessage(messages.sessionExpiredDescription)}
      dismissButtonLabel={formatMessage(messages.staySignedOut)}
      onClose={handleStaySignedOut}
      onClearSession={onClearSession}
      onResetState={onResetState}
    />
  );
};

export default SessionExpiredModal;

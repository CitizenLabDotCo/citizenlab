import React from 'react';

import { IUserData } from 'api/users/types';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  user: IUserData;
}

const EmailBounceStatus = ({ user }: Props) => {
  const { invite_status, confirmation_required, registration_completed_at } =
    user.attributes;

  if (invite_status === 'pending') {
    return <FormattedMessage {...messages.emailBouncesStatusPendingInvite} />;
  }

  if (confirmation_required) {
    return (
      <FormattedMessage {...messages.emailBouncesStatusAwaitingConfirmation} />
    );
  }

  if (!registration_completed_at) {
    return (
      <FormattedMessage
        {...messages.emailBouncesStatusRegistrationIncomplete}
      />
    );
  }

  return <FormattedMessage {...messages.emailBouncesStatusRegistered} />;
};

export default EmailBounceStatus;

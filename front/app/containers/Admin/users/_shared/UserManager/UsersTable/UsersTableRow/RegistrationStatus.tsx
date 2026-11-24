import React from 'react';

import moment from 'moment';

import { IUserData } from 'api/users/types';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../../../messages';

interface Props {
  user: IUserData;
}

const RegistrationStatus = ({ user }: Props) => {
  const { invite_status, registration_completed_at } = user.attributes;

  if (invite_status === 'pending') {
    /*
      For the 'all registered users' group, we do not show invited Users who have not yet accepted their invites,
      but we do in groups they have been added to when invited.

      The 'Invitation pending' message should clarify this.

      https://citizenlab.atlassian.net/browse/CL-2255
    */
    return (
      <i>
        <FormattedMessage {...messages.userInvitationPending} />
      </i>
    );
  }

  if (!registration_completed_at) {
    return (
      <i>
        <FormattedMessage {...messages.registrationNotCompleted} />
      </i>
    );
  }

  return <>{moment(registration_completed_at).format('LL')}</>;
};

export default RegistrationStatus;

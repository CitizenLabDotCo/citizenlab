import React from 'react';

import { Badge, colors } from '@citizenlab/cl2-component-library';

import { IUserData } from 'api/users/types';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  user: IUserData;
}

const InviteBadge = ({ user }: Props) => {
  const { invite_status } = user.attributes;

  if (invite_status === 'pending') {
    return (
      <Badge>
        <FormattedMessage {...messages.inviteStatusPending} />
      </Badge>
    );
  }

  if (invite_status === 'accepted') {
    return (
      <Badge color={colors.success}>
        <FormattedMessage {...messages.inviteStatusAccepted} />
      </Badge>
    );
  }

  return null;
};

export default InviteBadge;

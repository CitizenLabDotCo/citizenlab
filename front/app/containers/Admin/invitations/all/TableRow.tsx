import React from 'react';

import {
  Tr,
  Td,
  Badge,
  colors,
  IconButton,
} from '@citizenlab/cl2-component-library';
import { FormattedDate } from 'react-intl';

import { IInviteData } from 'api/invites/types';
import useDeleteInvite from 'api/invites/useDeleteInvite';
import useUserById from 'api/users/useUserById';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import messages from '../messages';

interface InputProps {
  invite: IInviteData;
}

const TableRow = (inputProps: InputProps) => {
  const { formatMessage } = useIntl();
  const { mutate: deleteInvite } = useDeleteInvite();
  const userId = inputProps.invite.relationships.invitee.data.id;
  const { data: user } = useUserById(userId);

  const handleOnDeleteInvite = () => {
    if (window.confirm(formatMessage(messages.deleteInviteConfirmation))) {
      const inviteId = invite.id;
      deleteInvite(inviteId);
    }
  };

  if (!user) return null;

  return (
    // To test invitation flow, we need the token, hence this className
    <Tr
      key={inputProps.invite.id}
      className={inputProps.invite.attributes.token}
    >
      <Td>{user.data.attributes.email}</Td>
      <Td>
        <span>{getFullName(user.data)}</span>
      </Td>
      <Td>
        <FormattedDate value={inputProps.invite.attributes.created_at} />
      </Td>
      <Td style={{ textAlign: 'center' }}>
        {user.data.attributes.invite_status === 'pending' ? (
          <Badge>
            <FormattedMessage {...messages.inviteStatusPending} />
          </Badge>
        ) : (
          <Badge color={colors.success}>
            <FormattedMessage {...messages.inviteStatusAccepted} />
          </Badge>
        )}
      </Td>
      <Td display="flex" justifyContent="center">
        <IconButton
          buttonType="button"
          iconName="delete"
          a11y_buttonActionMessage={formatMessage(messages.a11y_removeInvite)}
          onClick={handleOnDeleteInvite}
          iconColor={colors.textSecondary}
          iconColorOnHover={colors.error}
        />
      </Td>
    </Tr>
  );
};

export default TableRow;

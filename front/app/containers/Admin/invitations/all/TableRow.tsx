import React from 'react';

import { Tr, Td, colors, IconButton } from '@citizenlab/cl2-component-library';
import { FormattedDate } from 'react-intl';

import { IInviteData } from 'api/invites/types';
import useDeleteInvite from 'api/invites/useDeleteInvite';
import useUserById from 'api/users/useUserById';

import { useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import messages from '../messages';

import InviteBadge from './InviteBadge';

interface InputProps {
  invite: IInviteData;
}

const TableRow = ({ invite }: InputProps) => {
  const { formatMessage } = useIntl();
  const { mutate: deleteInvite } = useDeleteInvite();
  const userId = invite.relationships.invitee.data.id;
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
    <Tr key={invite.id} className={invite.attributes.token}>
      <Td>{user.data.attributes.email}</Td>
      <Td>
        <span>{getFullName(user.data)}</span>
      </Td>
      <Td>
        <FormattedDate value={invite.attributes.created_at} />
      </Td>
      <Td style={{ textAlign: 'center' }}>
        <InviteBadge user={user.data} />
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

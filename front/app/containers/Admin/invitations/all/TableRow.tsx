import React from 'react';

// api
import { IInviteData } from 'api/invites/types';
import useDeleteInvite from 'api/invites/useDeleteInvite';
import useUserById from 'api/users/useUserById';

// components
import { Button as SemanticButton, Popup } from 'semantic-ui-react';
import { Tr, Td, Badge, colors } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { FormattedDate } from 'react-intl';
import messages from '../messages';
import { getFullName } from 'utils/textUtils';

interface InputProps {
  invite: IInviteData;
}

const TableRow = (inputProps: InputProps) => {
  const { mutate: deleteInvite } = useDeleteInvite();
  const userId = inputProps.invite.relationships.invitee.data.id;
  const { data: user } = useUserById(userId);

  const handleOnDeleteInvite = () => {
    const inviteId = inputProps.invite.id;
    deleteInvite(inviteId);
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
      <Td style={{ textAlign: 'center' }}>
        <Popup
          trigger={<SemanticButton icon="trash" />}
          content={
            <SemanticButton
              color="red"
              content={<FormattedMessage {...messages.confirmDelete} />}
              onClick={handleOnDeleteInvite}
            />
          }
          on="click"
          position="bottom right"
        />
      </Td>
    </Tr>
  );
};

export default TableRow;

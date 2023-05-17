import React from 'react';

// services
import { IInviteData, deleteInvite } from 'services/invites';

// hooks
import useUserById from 'api/users/useUserById';

// components
import { Button as SemanticButton, Popup } from 'semantic-ui-react';
import { Tr, Td, Badge } from '@citizenlab/cl2-component-library';

// styling
import { colors } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { FormattedDate } from 'react-intl';
import messages from '../messages';

interface InputProps {
  invite: IInviteData;
}

const TableRow = (inputProps: InputProps) => {
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
        <span>
          {user.data.attributes.first_name} {user.data.attributes.last_name}
        </span>
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

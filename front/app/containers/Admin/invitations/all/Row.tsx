import React from 'react';
import { colors } from 'utils/styleUtils';
import { FormattedMessage } from 'utils/cl-intl';
import { FormattedDate } from 'react-intl';
import messages from '../messages';
import { IInviteData, deleteInvite } from 'services/invites';
import GetUser from 'resources/GetUser';
import { Table, Button as SemanticButton, Popup } from 'semantic-ui-react';
import { Badge } from '@citizenlab/cl2-component-library';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  invite: IInviteData;
}

export default (inputProps: InputProps) => (
  <GetUser id={inputProps.invite.relationships.invitee.data.id}>
    {(user) => {
      const handleOnDeleteInvite = (inviteId: string) => () =>
        deleteInvite(inviteId);

      if (isNilOrError(user)) return null;

      return (
        // To test invitation flow, we need the token, hence this className
        <Table.Row
          key={inputProps.invite.id}
          className={inputProps.invite.attributes.token}
        >
          <Table.Cell>{user.attributes.email}</Table.Cell>
          <Table.Cell>
            <span>
              {user.attributes.first_name} {user.attributes.last_name}
            </span>
          </Table.Cell>
          <Table.Cell>
            <FormattedDate value={inputProps.invite.attributes.created_at} />
          </Table.Cell>
          <Table.Cell textAlign="center">
            {user.attributes.invite_status === 'pending' ? (
              <Badge>
                <FormattedMessage {...messages.inviteStatusPending} />
              </Badge>
            ) : (
              <Badge color={colors.clGreen}>
                <FormattedMessage {...messages.inviteStatusAccepted} />
              </Badge>
            )}
          </Table.Cell>
          <Table.Cell textAlign="center">
            <Popup
              trigger={<SemanticButton icon="trash" />}
              content={
                <SemanticButton
                  color="red"
                  content={<FormattedMessage {...messages.confirmDelete} />}
                  onClick={handleOnDeleteInvite(inputProps.invite.id)}
                />
              }
              on="click"
              position="bottom right"
            />
          </Table.Cell>
        </Table.Row>
      );
    }}
  </GetUser>
);

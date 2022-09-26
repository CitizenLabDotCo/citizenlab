import { Badge } from '@citizenlab/cl2-component-library';
import React from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';
import GetUser from 'resources/GetUser';
import { Button as SemanticButton, Popup, Table } from 'semantic-ui-react';
import { deleteInvite, IInviteData } from 'services/invites';
import { isNilOrError } from 'utils/helperUtils';
import { colors } from 'utils/styleUtils';
import messages from '../messages';

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

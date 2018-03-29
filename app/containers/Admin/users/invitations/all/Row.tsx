import * as React from 'react';
import { colors } from 'utils/styleUtils';

import { FormattedMessage } from 'utils/cl-intl';
import { FormattedDate } from 'react-intl';
import messages from '../../messages';

import { IInviteData, deleteInvite } from 'services/invites';
import GetUser, { GetUserChildProps } from 'utils/resourceLoaders/components/GetUser';

import { Table, Button as SemanticButton, Popup } from 'semantic-ui-react';
import Badge from 'components/admin/Badge';

type Props = {
  invite: IInviteData;
};

type State = {};

class Row extends React.PureComponent<Props & GetUserChildProps, State> {

  handleOnDeleteInvite = (inviteId: string) => () => {
    deleteInvite(inviteId);
  }

  render() {
    const { invite, user } = this.props;
    if (!user) return null;
    const { first_name, last_name } = user.attributes;
    return (
      <Table.Row key={invite.id}>
        <Table.Cell>
          {user.attributes.email}
        </Table.Cell>
        <Table.Cell>
          <span>{first_name} {last_name}</span>
        </Table.Cell>
        <Table.Cell>
          <FormattedDate value={invite.attributes.created_at} />
        </Table.Cell>
        <Table.Cell textAlign="center">
          {user.attributes.invite_status === 'pending'
          ?
            <Badge><FormattedMessage {...messages.inviteStatusPending} /></Badge>
          :
            <Badge color={colors.clBlueLight}><FormattedMessage {...messages.inviteStatusAccepted} /></Badge>
          }
        </Table.Cell>
        <Table.Cell textAlign="center">
          <Popup
            trigger={<SemanticButton icon="trash" />}
            content={<SemanticButton color="red" content={<FormattedMessage {...messages.confirmDelete} />} onClick={this.handleOnDeleteInvite(invite.id)} />}
            on="click"
            position="bottom right"
          />
        </Table.Cell>
      </Table.Row>
    );
  }
}


export default (props) => (
  <GetUser id={props.invite.relationships.invitee.data.id}>
    {(getUserChildProps) => <Row {...props} {...getUserChildProps} />}
  </GetUser>
);

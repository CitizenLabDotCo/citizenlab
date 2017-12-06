import * as React from 'react';
import { List } from 'immutable';

// components
// import ActionButton from 'components/buttons/action.js';
import { Table, Popup, Button } from 'semantic-ui-react';
import SliderForm from './SliderForm';
import { FormattedDate } from 'react-intl';
import {  FormattedMessage } from 'utils/cl-intl';
import Avatar from 'components/Avatar';

// store
import { preprocess } from 'utils';
import { createStructuredSelector } from 'reselect';
import { deleteUserRequest } from 'resources/users/actions';
import { wrapActionWithPrefix } from 'utils/resources/actions';

// messages
import messages from './messages';
import { ACTION_PREFIX } from './constants';

// style
import styled from 'styled-components';

const AvatarWrapper = styled.div`
  svg {
    width: 1.5rem;
  }
`;

interface Props {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  deleteUser: {(event): void};
  roles: List<string>;
}


const Row = ({ userId, firstName, lastName, email, createdAt, roles, deleteUser }: Props) => (
  <Table.Row>
    <Table.Cell textAlign={'center'}>
      <AvatarWrapper>
        <Avatar userId={userId} size="small" />
      </AvatarWrapper>
    </Table.Cell>
    <Table.Cell>{firstName} {lastName}</Table.Cell>
    <Table.Cell>{email}</Table.Cell>
    <Table.Cell><FormattedDate value={createdAt} /></Table.Cell>
    <Table.Cell>
      <SliderForm roles={roles} userId={userId} />
    </Table.Cell>
    <Table.Cell>
      <Popup
        trigger={<Button icon="trash" onClick={deleteUser} />}
        content={<FormattedMessage {...messages.delete} />}
        position="right center"
      />
    </Table.Cell>
  </Table.Row>
);

const mapStateToProps = () => createStructuredSelector({
  user: (state, { userId }) => state.getIn(['resources', 'users', userId]),
});

const mapDispatchToProps = {
  deleteUser: wrapActionWithPrefix(deleteUserRequest, ACTION_PREFIX),
};

const mergeProps = (stateP, dispatchP, ownP) => {
  const { userId } = ownP;
  const attributes = stateP.user.get('attributes');
  const avatar = attributes.getIn(['avatar', 'medium']);
  const firstName = attributes.get('first_name');
  const lastName = attributes.get('last_name');
  const email = attributes.get('email');
  const createdAt = attributes.get('created_at');
  const roles = attributes.get('roles');
  const deleteUser = () => dispatchP.deleteUser(userId);

  return { userId, avatar, firstName, lastName, email, createdAt, roles, deleteUser };
};

export default preprocess(mapStateToProps, mapDispatchToProps, mergeProps)(Row);

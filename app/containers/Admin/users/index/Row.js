import React from 'react';
import PropTypes from 'prop-types';
import ImPropTypes from 'react-immutable-proptypes';

// components
// import ActionButton from 'components/buttons/action.js';
import { Table, Popup, Button } from 'semantic-ui-react';
import SliderForm from './SliderForm';
import { FormattedDate } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';

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

const UserImage = styled.img`
  height: 46px;
  cursor: pointer;
  display: flex;
  border-radius: 50%;
  opacity: 0.75;
  transition: opacity 200ms ease;
  &:hover {
    opacity: 1;
  }
`;

const Row = ({ userId, avatar, firstName, lastName, email, createdAt, roles, deleteUser }) => (
  <Table.Row>
    <Table.Cell textAlign={'center'}>
      <UserImage avatar src={avatar} />
    </Table.Cell>
    <Table.Cell>{firstName} {lastName}</Table.Cell>
    <Table.Cell>{email}</Table.Cell>
    <Table.Cell><FormattedDate value={createdAt}></FormattedDate></Table.Cell>
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

Row.propTypes = {
  avatar: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
  deleteUser: PropTypes.func.isRequired,
  roles: ImPropTypes.list.isRequired,
};

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

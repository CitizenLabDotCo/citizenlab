import React from 'react';
import PropTypes from 'prop-types';
import ImPropTypes from 'react-immutable-proptypes';
import { push } from 'react-router-redux';

// components
import ActionButton from 'components/buttons/action.js';
import { Table } from 'semantic-ui-react';
import SliderForm from './sliderForm';
// store
import { preprocess } from 'utils';
import { createStructuredSelector } from 'reselect';
import { updateUserRequest, deleteUserRequest } from 'resources/users/actions';

// messages
import messages from './messages';

const Row = ({ userId, firstName, lastName, email, createdAt, roles, deleteUser }) => (
  <Table.Row>
    <Table.Cell>avatar</Table.Cell>
    <Table.Cell>{firstName}</Table.Cell>
    <Table.Cell>{lastName}</Table.Cell>
    <Table.Cell>{email}</Table.Cell>
    <Table.Cell>{createdAt}</Table.Cell>
    <Table.Cell>
      <SliderForm roles={roles} userId={userId} />
    </Table.Cell>
    <Table.Cell>
      <ActionButton action={deleteUser} message={messages.deleteButton} fluid={false} />
    </Table.Cell>
  </Table.Row>
);

Row.propTypes = {
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

const mergeProps = (stateP, dispatchP, ownP) => {
  const { userId } = ownP;
  const attributes = stateP.user.get('attributes');
  const avatar = attributes.getIn(['avatar', 'small']);
  const firstName = attributes.get('first_name');
  const lastName = attributes.get('last_name');
  const email = attributes.get('email');
  const createdAt = attributes.get('created_at');
  const roles = attributes.get('roles');
  const deleteUser = () => dispatchP.deleteUser(userId);

  return { userId, avatar, firstName, lastName, email, createdAt, roles, deleteUser };
};

export default preprocess(mapStateToProps, { goTo: push, deleteUser: deleteUserRequest, updateUser: updateUserRequest }, mergeProps)(Row);

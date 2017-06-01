import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { push } from 'react-router-redux';

// components
import T from 'utils/containers/t';
import ActionButton from 'components/buttons/action.js';

// store
import { preprocess } from 'utils';
import { createStructuredSelector } from 'reselect';
import { deleteUserRequest } from 'resources/users/actions';

// messages
import messages from '../messages';

const Item = ({ title, goToEdit, deleteUser }) => (
  <div style={{ height: '35px', marginTop: '10px', backgroundColor: 'white' }}>
    <ActionButton action={deleteUser} message={messages.deleteButton} fluid={false} />
    <ActionButton action={goToEdit} message={messages.updateButton} />
    <span> <T value={title} /> </span>
  </div>
);

Item.propTypes = {
  title: ImmutablePropTypes.map,
  goToEdit: PropTypes.func.isRequired,
  deleteUser: PropTypes.func.isRequired,
};

const mapStateToProps = () => createStructuredSelector({
  user: (state, { userId }) => state.getIn(['resources', 'users', userId]),
});

const mergeProps = (stateP, dispatchP, ownP) => {
  const { userId } = ownP;
  const { user } = stateP;

  const title = user.getIn(['attributes', 'title_multiloc']);

  const goToEdit = () => dispatchP.goTo(`/admin/users/${userId}/edit`);
  const deleteUser = () => dispatchP.deleteUser(userId);

  return { title, goToEdit, deleteUser, userId };
};

export default preprocess(mapStateToProps, { goTo: push, deleteUser: deleteUserRequest }, mergeProps)(Item);


/*
        <Table.Row key={user.get('id')}>
          <Table.Cell>{user.getIn(['attributes', 'first_name'])}</Table.Cell>
          <Table.Cell>{user.getIn(['attributes', 'last_name'])}</Table.Cell>
          <Table.Cell>{user.getIn(['attributes', 'email'])}</Table.Cell>
          <Table.Cell>{user.getIn(['attributes', 'created_at'])}</Table.Cell>
        </Table.Row>

*/
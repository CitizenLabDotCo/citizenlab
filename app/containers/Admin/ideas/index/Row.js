import React from 'react';
import PropTypes from 'prop-types';
// import ImPropTypes from 'react-immutable-proptypes';

// components
// import ActionButton from 'components/buttons/action.js';
import { Table } from 'semantic-ui-react';
import { FormattedDate } from 'react-intl';
import T from 'containers/T';
// store
// import { preprocess } from 'utils';
// import { createStructuredSelector } from 'reselect';
// import { deleteUserRequest } from 'resources/users/actions';
// import { wrapActionWithPrefix } from 'utils/resources/actions';

// messages
// import messages from './messages';
// import { ACTION_PREFIX } from './constants';

// style
// import styled from 'styled-components';

class Row extends React.PureComponent {

  render() {
    const idea = this.props.idea;
    return (
      <Table.Row>
        <Table.Cell>
          <T value={idea.attributes.title_multiloc} />
        </Table.Cell>
        <Table.Cell></Table.Cell>
        <Table.Cell></Table.Cell>
        <Table.Cell>
          <FormattedDate value={idea.attributes.published_at} />
        </Table.Cell>
        <Table.Cell>
        </Table.Cell>
        <Table.Cell>
        </Table.Cell>
      </Table.Row>
    );
  }
}

Row.propTypes = {
  idea: PropTypes.object,
};

// const mapStateToProps = () => createStructuredSelector({
//   user: (state, { userId }) => state.getIn(['resources', 'users', userId]),
// });

// const mapDispatchToProps = {
//   deleteUser: wrapActionWithPrefix(deleteUserRequest, ACTION_PREFIX),
// };

// const mergeProps = (stateP, dispatchP, ownP) => {
//   const { userId } = ownP;
//   const attributes = stateP.user.get('attributes');
//   const firstName = attributes.get('first_name');
//   const lastName = attributes.get('last_name');
//   const email = attributes.get('email');
//   const createdAt = attributes.get('created_at');
//   const roles = attributes.get('roles');
//   const deleteUser = () => dispatchP.deleteUser(userId);

//   return { userId, firstName, lastName, email, createdAt, roles, deleteUser };
// };

// export default preprocess(mapStateToProps, mapDispatchToProps, mergeProps)(Row);

export default Row;

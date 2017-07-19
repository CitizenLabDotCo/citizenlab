import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
// import ImPropTypes from 'react-immutable-proptypes';

// components
// import ActionButton from 'components/buttons/action.js';
import { Table, Icon, Dropdown } from 'semantic-ui-react';
import { FormattedDate } from 'react-intl';
import T from 'containers/T';
import { injectTFunc } from 'utils/containers/t/utils';

// store
// import { preprocess } from 'utils';
// import { createStructuredSelector } from 'reselect';
// import { deleteUserRequest } from 'resources/users/actions';
// import { wrapActionWithPrefix } from 'utils/resources/actions';

// messages
// import messages from './messages';
// import { ACTION_PREFIX } from './constants';

// style
import styled from 'styled-components';

const StyledRow = styled.tr`
  height: 5rem;
`;

class Row extends PureComponent {

  handleIdeaStatusChange = (event, data) => {
    this.props.onIdeaStatusChange(data.value);
  }

  ideaStatusOptions = () => {
    return this.props.ideaStatuses.map((status) => ({
      value: status.id,
      text: this.props.tFunc(status.attributes.title_multiloc),
    }));
  }

  render() {
    const { idea } = this.props;
    const attrs = idea.attributes;
    return (
      <Table.Row as={StyledRow}>
        <Table.Cell>
          <T value={attrs.title_multiloc} />
        </Table.Cell>
        <Table.Cell>{attrs.author_name}</Table.Cell>
        <Table.Cell>
          <FormattedDate value={attrs.published_at} />
        </Table.Cell>
        <Table.Cell>
          <Icon name="thumbs up" />
          {attrs.upvotes_count}
        </Table.Cell>
        <Table.Cell>
          <Icon name="thumbs down" />
          {attrs.downvotes_count}
        </Table.Cell>
        <Table.Cell>
          <Dropdown
            fluid
            selection
            options={this.ideaStatusOptions()}
            onChange={this.handleIdeaStatusChange}
            value={idea.relationships.idea_status.data.id}
          />
        </Table.Cell>
      </Table.Row>
    );
  }
}

Row.propTypes = {
  idea: PropTypes.object,
  ideaStatuses: PropTypes.array,
  onIdeaStatusChange: PropTypes.func,
  tFunc: PropTypes.func.isRequired,
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

export default injectTFunc(Row);

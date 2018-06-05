// Libraries
import React from 'react';
import { isArray, includes } from 'lodash';


// components
import UserTable from './UserTable';
import UserTableActions from './UserTableActions';

// Resources
import GetUsers, { GetUsersChildProps } from 'resources/GetUsers';

// Services
import { MembershipType } from 'services/groups';

// typings
interface InputProps {
  search: string | undefined;
  groupId?: string;
  groupType?: MembershipType;
  deleteUsersFromGroup?: (userIds: string[]) => void;
}

interface DataProps {
  users: GetUsersChildProps;
}

interface Props extends InputProps, DataProps { }

export interface State {
  selectedUsers: string[] | 'none' | 'all';
}


export class UserManager extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      selectedUsers: 'none',
    };
  }

  toggleAllUsers = () => {
    this.setState(state => ({ selectedUsers: (state.selectedUsers === 'all' ? 'none' : 'all') }));
  }

  handleUserSelectedOnChange = (allUsersIds: string[]) => (userId: string) => () => {
    this.setState((state) => {
      let newSelectedUsers: string[] | 'none' | 'all' = 'none';

      if (isArray(state.selectedUsers)) {
        if (includes(state.selectedUsers, userId)) {
          const userIds = state.selectedUsers.filter(item => item !== userId);
          newSelectedUsers = (userIds.length > 0 ? userIds : 'none');
        } else {
          newSelectedUsers = [...state.selectedUsers, userId];
        }
      } else if (state.selectedUsers === 'none') {
        newSelectedUsers = [userId];
      } else if (isArray(allUsersIds)) {
        newSelectedUsers = allUsersIds.filter(user => user !== userId).map(user => user);
      }

      return { selectedUsers: newSelectedUsers };
    });
  }

  render() {
    const { users, groupType } = this.props;
    const { selectedUsers } = this.state;

    if (isArray(users.usersList)) {
      const allUsersIds = users.usersList.map(user => user.id);
      return (
        <>
          <UserTableActions
            groupType={groupType}
            selectedUsers={selectedUsers}
            allUsersIds={allUsersIds}
            toggleSelectAll={this.toggleAllUsers}
            deleteUsersFromGroup={this.props.deleteUsersFromGroup}
          />
          <UserTable
            selectedUsers={selectedUsers}
            handleSelect={this.handleUserSelectedOnChange(allUsersIds)}
            {...users}
          />
        </>
      );
    }
    return null;
  }
}

export default (inputProps: InputProps) => (
  <GetUsers
    pageSize={15}
    cache={false}
    {...inputProps}
  >
    {(users) => <UserManager {...inputProps} users={users} />}
  </GetUsers>
);

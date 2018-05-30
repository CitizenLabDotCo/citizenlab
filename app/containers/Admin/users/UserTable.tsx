// Libraries
import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isAdmin } from 'services/permissions/roles';
import { isArray, includes, get } from 'lodash';

// Components
import Table from 'components/UI/Table';
import SortableTableHeaderCell from 'components/UI/Table/SortableTableHeaderCell';
import CustomPagination from 'components/admin/Pagination/CustomPagination';
import NoUsers from './NoUsers';
import UserTableActions from './UserTableActions';
import UserTableRow from './UserTableRow';

// Services
import { IUserData, IRole, updateUser } from 'services/users';

// Resources
import GetUsers, { GetUsersChildProps, SortAttribute } from 'resources/GetUsers';

// I18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Styling
import styled from 'styled-components';

const CustomPaginationWrapper = styled.div`
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
`;

// Typings
interface InputProps {
  groupId?: string | undefined;
  search?: string | undefined;
  usercount: number;
}

interface Props extends InputProps, GetUsersChildProps {}

interface State {
  selectedUsers: string[] | 'none' | 'all';
}

class Users extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedUsers: 'none',
    };
  }

  isUserAdmin = (user: IUserData) => {
    return isAdmin({ data: user });
  }

  handleAdminRoleOnChange = (user: IUserData) => () => {
    let newRoles: IRole[] = [];

    if (user.attributes.roles && isAdmin({ data: user })) {
      newRoles = user.attributes.roles.filter(role => role.type !== 'admin');
    } else {
      newRoles = [
        ...get(user, 'attributes.roles', []),
        { type: 'admin' }
      ];
    }

    updateUser(user.id, { roles: newRoles });
  }

  handleUserSelectedOnChange = (userId: string) => () => {
    this.setState((state) => {
      const { usersList } = this.props;
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
      } else if (!isNilOrError(usersList)) {
        newSelectedUsers = usersList.filter(user => user.id !== userId).map(user => user.id);
      }

      return { selectedUsers: newSelectedUsers };
    });
  }

  handleSortingOnChange = (sortAttribute: SortAttribute) => () => {
    this.props.onChangeSorting(sortAttribute);
  }

  handlePaginationClick = (pageNumber: number) => {
    this.setState(state => ({ selectedUsers: isArray(state.selectedUsers) ? 'none' : state.selectedUsers }));
    this.props.onChangePage(pageNumber);
  }

  toggleAllUsers = () => {
    this.setState(state => ({ selectedUsers: (state.selectedUsers === 'all' ? 'none' : 'all') }));
  }

  render() {
    const { usercount, usersList, sortAttribute, sortDirection, currentPage, lastPage } = this.props;
    const { selectedUsers } = this.state;

    if (!isNilOrError(usersList) && usersList.length === 0) {
      return <NoUsers />;
    }

    if (!isNilOrError(usersList) && usersList.length > 0) {
      return (
        <>
          <UserTableActions
            selectedUsers={selectedUsers}
            userCount={usercount}
            toggleSelectAll={this.toggleAllUsers}
          />

          <Table>
            <thead>
              <tr>
                <th />
                <th />
                <th className="sortable">
                  <SortableTableHeaderCell
                    value={<FormattedMessage {...messages.name} />}
                    onClick={this.handleSortingOnChange('last_name')}
                    sorted={sortAttribute === 'last_name' ? sortDirection : null}
                  />
                </th>
                <th>
                  <SortableTableHeaderCell
                    value={<FormattedMessage {...messages.email} />}
                    onClick={this.handleSortingOnChange('email')}
                    sorted={sortAttribute === 'email' ? sortDirection : null}
                  />
                </th>
                <th>
                  <SortableTableHeaderCell
                    value={<FormattedMessage {...messages.since} />}
                    onClick={this.handleSortingOnChange('created_at')}
                    sorted={sortAttribute === 'created_at' ? sortDirection : null}
                  />
                </th>
                <th>
                  <SortableTableHeaderCell
                    value={<FormattedMessage {...messages.admin} />}
                    onClick={this.handleSortingOnChange('role')}
                    sorted={sortAttribute === 'role' ? sortDirection : null}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((user) => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  selected={selectedUsers === 'all' || includes(selectedUsers, user.id)}
                  toggleSelect={this.handleUserSelectedOnChange(user.id)}
                  toggleAdmin={this.handleAdminRoleOnChange(user)}
                />
              ))}
            </tbody>
          </Table>

          {lastPage && lastPage > 1 &&
            <CustomPaginationWrapper>
              <CustomPagination
                currentPage={currentPage || 1}
                totalPages={lastPage || 1}
                loadPage={this.handlePaginationClick}
              />
            </CustomPaginationWrapper>
          }
        </>
      );
    }

    return null;
  }
}

export default (inputProps: InputProps) => (
  <GetUsers
    pageSize={15}
    groupId={inputProps.groupId}
    search={inputProps.search}
    cache={false}
  >
    {users => <Users {...inputProps} {...users} />}
  </GetUsers>
);

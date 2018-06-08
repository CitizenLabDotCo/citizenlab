// Libraries
import React from 'react';
import { isAdmin } from 'services/permissions/roles';
import { includes, get } from 'lodash';

// Components
import Table from 'components/UI/Table';
import SortableTableHeaderCell from 'components/UI/Table/SortableTableHeaderCell';
import CustomPagination from 'components/admin/Pagination/CustomPagination';

import UserTableRow from './UserTableRow';

// Services
import { IUserData, IRole, updateUser } from 'services/users';

// Resources
import { GetUsersChildProps, SortAttribute } from 'resources/GetUsers';
import { GetAuthUserChildProps } from 'resources/GetAuthUser';

// Events --- For error handling
import eventEmitter from 'utils/eventEmitter';
import events from './events';

// I18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Styles
import styled from 'styled-components';
const STable = styled(Table)`
  margin-top: 20px;
`;

// Typings
interface InputProps {
  selectedUsers: string[] | 'none' | 'all';
  handleSelect: (userId: string) => () => void;
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, GetUsersChildProps { }

interface State { }

export default class UsersTable extends React.PureComponent<Props, State> {

  isUserAdmin = (user: IUserData) => {
    return isAdmin({ data: user });
  }

  handleAdminRoleOnChange = (user: IUserData) => () => {
    let newRoles: IRole[] = [];

    const { authUser } = this.props;
    if (authUser && authUser.id === user.id) {
      eventEmitter.emit<JSX.Element>('usersAdmin', events.userRoleChangeFailed, <FormattedMessage {...messages.youCantUnadminYourself} />);
    } else {
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
  }

  handleSortingOnChange = (sortAttribute: SortAttribute) => () => {
    this.props.onChangeSorting(sortAttribute);
  }

  handlePaginationClick = (pageNumber: number) => {
    this.props.onChangePage(pageNumber);
  }


  render() {
    const { usersList, sortAttribute, sortDirection, currentPage, lastPage, selectedUsers } = this.props;
    const usersCount = Array.isArray(usersList) && usersList.length;

    if (Array.isArray(usersList) && usersCount && usersCount > 0) {
      return (
        <>
          <STable>
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
                <th>
                  <FormattedMessage tagName="div" {...messages.options} />
                </th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((user, index) => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  selected={selectedUsers === 'all' || includes(selectedUsers, user.id)}
                  toggleSelect={this.props.handleSelect(user.id)}
                  toggleAdmin={this.handleAdminRoleOnChange(user)}
                  authUser={this.props.authUser}
                  up={(usersCount > 8) ? (index > usersCount - 3) : false}
                />
              ))}
            </tbody>
          </STable>

          <CustomPagination
            currentPage={currentPage || 1}
            totalPages={lastPage || 1}
            loadPage={this.handlePaginationClick}
          />
        </>
      );
    }

    return null;
  }
}

// Libraries
import React, { PureComponent } from 'react';
import { isAdmin } from 'services/permissions/roles';
import { includes, get, isArray } from 'lodash-es';

// Components
import Table from 'components/UI/Table';
import SortableTableHeaderCell from 'components/UI/Table/SortableTableHeaderCell';
import Pagination from 'components/admin/Pagination/Pagination';
import UserTableRow from './UserTableRow';

// Services
import { IUserData, IRole, updateUser } from 'services/users';

// Resources
import { GetUsersChildProps, SortAttribute } from 'resources/GetUsers';
import { GetAuthUserChildProps } from 'resources/GetAuthUser';

// Events --- For error handling
import eventEmitter from 'utils/eventEmitter';
import events from './events';

// tracking
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// I18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;
`;

const StyledTable = styled(Table)`
  margin-top: 20px;

  tbody tr td {
    padding-top: 10px;
    padding-bottom: 10px;
  }

  tbody tr.selected {
    background: ${colors.background};
  }

  th,
  td {
    padding-left: 5px;
    padding-right: 5px;
    overflow-wrap: break-word;
  }

  thead tr th,
  tbody tr {
    border: none;
  }
`;

const StyledPagination = styled(Pagination)`
  margin-top: 12px;
`;

interface InputProps {
  selectedUsers: string[] | 'none' | 'all';
  handleSelect: (userId: string) => void;
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, GetUsersChildProps {}

interface State {}

interface Tracks {
  trackPagination: Function;
  trackToggleOneUser: Function;
  trackAdminToggle: Function;
  trackSortChange: Function;
}

class UsersTable extends PureComponent<Props & Tracks, State> {
  isUserAdmin = (user: IUserData) => {
    return isAdmin({ data: user });
  };

  handleAdminRoleOnChange = (user: IUserData) => () => {
    let newRoles: IRole[] = [];
    const { authUser, trackAdminToggle } = this.props;

    trackAdminToggle();

    if (authUser && authUser.id === user.id) {
      eventEmitter.emit<JSX.Element>(
        events.userRoleChangeFailed,
        <FormattedMessage {...messages.youCantUnadminYourself} />
      );
    } else {
      if (user.attributes.roles && isAdmin({ data: user })) {
        newRoles = user.attributes.roles.filter(
          (role) => role.type !== 'admin'
        );
      } else {
        newRoles = [...get(user, 'attributes.roles', []), { type: 'admin' }];
      }

      updateUser(user.id, { roles: newRoles });
    }
  };

  handleSortingOnChange = (sortAttribute: SortAttribute) => () => {
    this.props.trackSortChange({
      extra: {
        sortAttribute,
      },
    });
    this.props.onChangeSorting(sortAttribute);
  };

  handlePaginationClick = (pageNumber: number) => {
    this.props.trackPagination();
    this.props.onChangePage(pageNumber);
  };

  handleUserToggle = (userId) => () => {
    this.props.trackToggleOneUser();
    this.props.handleSelect(userId);
  };

  render() {
    const {
      usersList,
      sortAttribute,
      sortDirection,
      currentPage,
      lastPage,
      selectedUsers,
    } = this.props;
    const usersCount = isArray(usersList) && usersList.length;

    if (isArray(usersList) && usersCount && usersCount > 0) {
      return (
        <Container className="e2e-user-table">
          <StyledTable>
            <thead>
              <tr>
                <th />
                <th />
                <th>
                  <SortableTableHeaderCell
                    value={<FormattedMessage {...messages.name} />}
                    onClick={this.handleSortingOnChange('last_name')}
                    sorted={
                      sortAttribute === 'last_name' ? sortDirection : null
                    }
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
                    sorted={
                      sortAttribute === 'created_at' ? sortDirection : null
                    }
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
              {usersList.map((user) => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  selected={
                    selectedUsers === 'all' || includes(selectedUsers, user.id)
                  }
                  toggleSelect={this.handleUserToggle(user.id)}
                  toggleAdmin={this.handleAdminRoleOnChange(user)}
                  authUser={this.props.authUser}
                />
              ))}
            </tbody>
          </StyledTable>

          <StyledPagination
            currentPage={currentPage || 1}
            totalPages={lastPage || 1}
            loadPage={this.handlePaginationClick}
          />
        </Container>
      );
    }

    return null;
  }
}

export default injectTracks<Props>({
  trackPagination: tracks.pagination,
  trackToggleOneUser: tracks.toggleOneUser,
  trackAdminToggle: tracks.adminToggle,
  trackSortChange: tracks.sortChange,
})(UsersTable);

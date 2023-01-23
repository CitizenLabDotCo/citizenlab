// Libraries
import React, { PureComponent } from 'react';
import { isAdmin, TRole } from 'services/permissions/roles';
import { includes, get, isArray } from 'lodash-es';

// Components
import { Table, Thead, Th, Tbody, Tr } from '@citizenlab/cl2-component-library';
import Pagination from 'components/Pagination';
import UserTableRow from './UserTableRow';

// Services
import { IUserData, updateUser } from 'services/users';

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

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;
`;

const StyledPagination = styled(Pagination)`
  margin-top: 12px;
`;

interface SortableThProps {
  sortDirection: 'ascending' | 'descending' | undefined;
  onClick: () => void;
  children: React.ReactNode;
}

const Uppercase = styled.span`
  text-transform: uppercase;
`;

const SortableTh = ({ sortDirection, onClick, children }: SortableThProps) => (
  <Th clickable sortDirection={sortDirection} onClick={onClick}>
    <Uppercase>{children}</Uppercase>
  </Th>
);

interface InputProps {
  selectedUsers: string[] | 'none' | 'all';
  handleSelect: (userId: string) => void;
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, GetUsersChildProps {}

interface State {}

type Extra = { sortAttribute: SortAttribute };

interface Tracks {
  trackPagination: () => void;
  trackToggleOneUser: () => void;
  trackAdminToggle: () => void;
  trackSortChange: (value: { extra: Extra }) => void;
}

class UsersTable extends PureComponent<Props & Tracks, State> {
  isUserAdmin = (user: IUserData) => {
    return isAdmin({ data: user });
  };

  handleAdminRoleOnChange = (user: IUserData) => () => {
    let newRoles: TRole[] = [];
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
          <Table mt="20px">
            <Thead>
              <Tr>
                <Th />
                <Th />
                <SortableTh
                  sortDirection={
                    sortAttribute === 'last_name' ? sortDirection : undefined
                  }
                  onClick={this.handleSortingOnChange('last_name')}
                >
                  <FormattedMessage {...messages.name} />
                </SortableTh>
                <SortableTh
                  sortDirection={
                    sortAttribute === 'email' ? sortDirection : undefined
                  }
                  onClick={this.handleSortingOnChange('email')}
                >
                  <FormattedMessage {...messages.email} />
                </SortableTh>
                <SortableTh
                  sortDirection={
                    sortAttribute === 'created_at' ? sortDirection : undefined
                  }
                  onClick={this.handleSortingOnChange('created_at')}
                >
                  <FormattedMessage {...messages.since} />
                </SortableTh>
                <SortableTh
                  sortDirection={
                    sortAttribute === 'role' ? sortDirection : undefined
                  }
                  onClick={this.handleSortingOnChange('role')}
                >
                  <FormattedMessage {...messages.admin} />
                </SortableTh>
                <Th>
                  <Uppercase>
                    <FormattedMessage tagName="div" {...messages.options} />
                  </Uppercase>
                </Th>
              </Tr>
            </Thead>
            <Tbody>
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
            </Tbody>
          </Table>

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

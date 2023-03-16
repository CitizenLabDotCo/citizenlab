// Libraries
import React from 'react';
import { isAdmin, TRole } from 'services/permissions/roles';
import { includes, get, isArray } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
// Components
import { Table, Thead, Th, Tbody, Tr } from '@citizenlab/cl2-component-library';
import Pagination from 'components/Pagination';
import UserTableRow from './UserTableRow';

// Services
import { IUserData, updateUser } from 'services/users';

// Resources
import { GetUsersChildProps, SortAttribute } from 'resources/GetUsers';

// Events --- For error handling
import eventEmitter from 'utils/eventEmitter';
import events from './events';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// I18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Styles
import styled from 'styled-components';
import useAuthUser from 'hooks/useAuthUser';

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
}

interface Props extends InputProps, GetUsersChildProps {}

const UsersTable = ({
  usersList,
  sortAttribute,
  sortDirection,
  currentPage,
  lastPage,
  selectedUsers,
  handleSelect,
  onChangePage,
  onChangeSorting,
}: Props) => {
  const authUser = useAuthUser();

  if (isNilOrError(authUser)) {
    return null;
  }

  const handleAdminRoleOnChange = (user: IUserData) => () => {
    let newRoles: TRole[] = [];

    trackEventByName(tracks.adminToggle.name);

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

  const handleSortingOnChange = (sortAttribute: SortAttribute) => () => {
    trackEventByName(tracks.sortChange.name, {
      extra: {
        sortAttribute,
      },
    });
    onChangeSorting(sortAttribute);
  };

  const handlePaginationClick = (pageNumber: number) => {
    trackEventByName(tracks.pagination.name);
    onChangePage(pageNumber);
  };

  const handleUserToggle = (userId: string) => () => {
    trackEventByName(tracks.toggleOneUser.name);
    handleSelect(userId);
  };

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
                onClick={handleSortingOnChange('last_name')}
              >
                <FormattedMessage {...messages.name} />
              </SortableTh>
              <SortableTh
                sortDirection={
                  sortAttribute === 'email' ? sortDirection : undefined
                }
                onClick={handleSortingOnChange('email')}
              >
                <FormattedMessage {...messages.email} />
              </SortableTh>
              <SortableTh
                sortDirection={
                  sortAttribute === 'created_at' ? sortDirection : undefined
                }
                onClick={handleSortingOnChange('created_at')}
              >
                <FormattedMessage {...messages.since} />
              </SortableTh>
              <SortableTh
                sortDirection={
                  sortAttribute === 'role' ? sortDirection : undefined
                }
                onClick={handleSortingOnChange('role')}
              >
                <FormattedMessage {...messages.status} />
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
                toggleSelect={handleUserToggle(user.id)}
                toggleAdmin={handleAdminRoleOnChange(user)}
                authUser={authUser}
              />
            ))}
          </Tbody>
        </Table>

        <StyledPagination
          currentPage={currentPage || 1}
          totalPages={lastPage || 1}
          loadPage={handlePaginationClick}
        />
      </Container>
    );
  }

  return null;
};

export default UsersTable;

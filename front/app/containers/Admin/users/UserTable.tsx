// Libraries
import React from 'react';
import { TRole } from 'services/permissions/roles';
import { includes, isArray } from 'lodash-es';
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
import Warning from 'components/UI/Warning';

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;
`;

const StyledPagination = styled(Pagination)`
  margin-top: 12px;
`;

const Uppercase = styled.span`
  text-transform: uppercase;
`;

interface SortableThProps {
  sortDirection: 'ascending' | 'descending' | undefined;
  onClick: () => void;
  children: React.ReactNode;
}

const SortableTh = ({ sortDirection, onClick, children }: SortableThProps) => (
  <Th clickable sortDirection={sortDirection} onClick={onClick}>
    <Uppercase>{children}</Uppercase>
  </Th>
);

interface InputProps {
  selectedUsers: string[] | 'none' | 'all';
  handleSelect: (userId: string) => void;
  notCitizenlabMember: boolean;
  currentPage: number | null;
  lastPage: number | null;
  sortAttribute: SortAttribute;
  sortDirection: 'ascending' | 'descending' | undefined;
  onChangePage: (pageNumber: number) => void;
  onChangeSorting: (sortAttribute: SortAttribute) => void;
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
  notCitizenlabMember,
}: Props) => {
  const authUser = useAuthUser();

  if (isNilOrError(authUser)) {
    return null;
  }

  const handleChangeRoles = (user: IUserData, changeToNormalUser: boolean) => {
    trackEventByName(tracks.adminChangeRole.name);

    if (authUser.id === user.id) {
      eventEmitter.emit<JSX.Element>(
        events.userRoleChangeFailed,
        <FormattedMessage {...messages.youCantUnadminYourself} />
      );
    } else {
      updateUser(user.id, { roles: getNewRoles(user, changeToNormalUser) });
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

  if (isArray(usersList) && usersList.length > 0) {
    return (
      <Container className="e2e-user-table">
        {process.env.NODE_ENV === 'development' && notCitizenlabMember && (
          <Warning>
            <span>
              <b>@citizenlab.co</b> email addresses are not included as admins &
              managers.
            </span>
          </Warning>
        )}
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
              <Th>
                <Uppercase>
                  <FormattedMessage {...messages.status} />
                </Uppercase>
              </Th>
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
                userInRow={user}
                selected={
                  selectedUsers === 'all' || includes(selectedUsers, user.id)
                }
                toggleSelect={handleUserToggle(user.id)}
                changeRoles={handleChangeRoles}
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

const getNewRoles = (user: IUserData, changeToNormalUser: boolean): TRole[] => {
  if (!user.attributes.roles || changeToNormalUser) {
    return [];
  }

  return [...user.attributes.roles, { type: 'admin' }];
};

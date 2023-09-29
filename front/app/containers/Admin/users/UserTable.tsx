// Libraries
import React from 'react';
import { TRole } from 'utils/permissions/roles';
import { includes, isArray } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
// Components
import { Table, Thead, Th, Tbody, Tr } from '@citizenlab/cl2-component-library';
import Pagination from 'components/Pagination';
import UserTableRow from './UserTableRow';

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
import useAuthUser from 'api/me/useAuthUser';
import Warning from 'components/UI/Warning';
import { IQueryParameters, IUserData } from 'api/users/types';
import useUpdateUser from 'api/users/useUpdateUser';

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

interface Props {
  selectedUsers: string[] | 'none' | 'all';
  handleSelect: (userId: string) => void;
  notCitizenlabMember?: boolean;
  currentPage: number | null;
  lastPage: number | null;
  sort: IQueryParameters['sort'];
  onChangePage: (pageNumber: number) => void;
  onChangeSorting: (sort: IQueryParameters['sort']) => void;
  usersList: IUserData[];
}

const UsersTable = ({
  usersList,
  sort,
  currentPage,
  lastPage,
  selectedUsers,
  handleSelect,
  onChangePage,
  onChangeSorting,
  notCitizenlabMember,
}: Props) => {
  const { data: authUser } = useAuthUser();
  const { mutate: updateUser } = useUpdateUser();

  if (isNilOrError(authUser)) {
    return null;
  }

  const handleChangeRoles = (user: IUserData, changeToNormalUser: boolean) => {
    trackEventByName(tracks.adminChangeRole.name);

    if (authUser.data.id === user.id) {
      eventEmitter.emit<JSX.Element>(
        events.userRoleChangeFailed,
        <FormattedMessage {...messages.youCantUnadminYourself} />
      );
    } else {
      updateUser({
        userId: user.id,
        roles: getNewRoles(user, changeToNormalUser),
      });
    }
  };

  const handleSortingOnChange = (sort: IQueryParameters['sort']) => () => {
    trackEventByName(tracks.sortChange.name, {
      extra: {
        sort,
      },
    });
    onChangeSorting(sort);
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
                  sort === 'last_name'
                    ? 'descending'
                    : sort === '-last_name'
                    ? 'ascending'
                    : undefined
                }
                onClick={handleSortingOnChange(
                  sort === 'last_name' ? '-last_name' : 'last_name'
                )}
              >
                <FormattedMessage {...messages.name} />
              </SortableTh>
              <SortableTh
                sortDirection={
                  sort === 'email'
                    ? 'descending'
                    : sort === '-email'
                    ? 'ascending'
                    : undefined
                }
                onClick={handleSortingOnChange(
                  sort === 'email' ? '-email' : 'email'
                )}
              >
                <FormattedMessage {...messages.email} />
              </SortableTh>
              <SortableTh
                sortDirection={
                  sort === 'created_at'
                    ? 'descending'
                    : sort === '-created_at'
                    ? 'ascending'
                    : undefined
                }
                onClick={handleSortingOnChange(
                  sort === 'created_at' ? '-created_at' : 'created_at'
                )}
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
                authUser={authUser.data}
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

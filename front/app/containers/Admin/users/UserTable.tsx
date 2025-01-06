import React from 'react';

import { Table, Thead, Th, Tbody, Tr } from '@citizenlab/cl2-component-library';
import { includes, isArray } from 'lodash-es';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';
import { IQueryParameters, IUserData } from 'api/users/types';
import useUpdateUser from 'api/users/useUpdateUser';

import Pagination from 'components/Pagination';
import Warning from 'components/UI/Warning';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';
import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';
import { TRole } from 'utils/permissions/roles';

import events from './events';
import messages from './messages';
import tracks from './tracks';
import UserTableRow from './UserTableRow';

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
    trackEventByName(tracks.adminChangeRole);

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
    trackEventByName(tracks.sortChange, {
      sort,
    });
    onChangeSorting(sort);
  };

  const handlePaginationClick = (pageNumber: number) => {
    trackEventByName(tracks.pagination);
    onChangePage(pageNumber);
  };

  const handleUserToggle = (userId: string) => () => {
    trackEventByName(tracks.toggleOneUser);
    handleSelect(userId);
  };

  if (isArray(usersList) && usersList.length > 0) {
    return (
      <Container className="e2e-user-table">
        {process.env.NODE_ENV === 'development' && notCitizenlabMember && (
          <Warning>
            <span>
              <b>@govocal.com & @citizenlab.co</b> email addresses are not
              included as admins & managers.
            </span>
          </Warning>
        )}
        <Table mt="20px">
          <Thead>
            <Tr>
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
              <Th>
                <Uppercase>
                  <FormattedMessage {...messages.role} />
                </Uppercase>
              </Th>
              <SortableTh
                sortDirection={
                  sort === 'last_active_at'
                    ? 'descending'
                    : sort === '-last_active_at'
                    ? 'ascending'
                    : undefined
                }
                onClick={handleSortingOnChange(
                  sort === 'last_active_at'
                    ? '-last_active_at'
                    : 'last_active_at'
                )}
              >
                <FormattedMessage {...messages.lastActive} />
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
                <FormattedMessage {...messages.joined} />
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

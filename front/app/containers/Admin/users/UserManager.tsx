import React, { useEffect, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { isArray, includes, isString, isEmpty } from 'lodash-es';
import { Subscription } from 'rxjs';

import { MembershipType } from 'api/groups/types';
import { IQueryParameters } from 'api/users/types';
import useUsers from 'api/users/useUsers';

import Error from 'components/UI/Error';

import eventEmitter from 'utils/eventEmitter';
import { isNil } from 'utils/helperUtils';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import events from './events';
import NoUsers from './NoUsers';
import UserTable from './UserTable';
import UserTableActions from './UserTableActions';

interface Props {
  groupId?: IQueryParameters['group'];
  groupType?: MembershipType;
  onlyBlocked?: IQueryParameters['only_blocked'];
  deleteUsersFromGroup?: (userIds: string[]) => void;
  canModerate?: IQueryParameters['can_moderate'];
  canAdmin?: IQueryParameters['can_admin'];
  notCitizenlabMember?: IQueryParameters['not_citizenlab_member'];
  includeInactive?: IQueryParameters['include_inactive'];
}

type error = {
  errorName: string;
  errorElement: JSX.Element;
};

type SelectedUsersType = string[] | 'none' | 'all';

const UserManager = ({
  groupId,
  groupType,
  notCitizenlabMember,
  deleteUsersFromGroup,
  includeInactive,
  canModerate,
  canAdmin,
  onlyBlocked,
}: Props) => {
  const [sort, setSort] = useState<IQueryParameters['sort']>('-created_at');
  const [pageNumber, setPageNumber] =
    useState<IQueryParameters['pageNumber']>(1);
  const [selectedUsers, setSelectedUsers] = useState<SelectedUsersType>('none');
  const [errors, setErrors] = useState<error[]>([]);
  const [search, setSearch] = useState<string | undefined>(undefined);
  const searchUser = (searchTerm: string) => {
    setSearch(isString(searchTerm) && !isEmpty(searchTerm) ? searchTerm : '');
  };

  const { data: users } = useUsers({
    include_inactive: includeInactive,
    search,
    group: groupId,
    can_moderate: canModerate,
    only_blocked: onlyBlocked,
    sort,
    pageNumber,
    not_citizenlab_member: notCitizenlabMember,
    can_admin: canAdmin,
  });

  useEffect(() => {
    // When an error occurs, print it for 4 seconds then remove the message from the component state
    const handleError = (errorName, errorElement) => {
      setErrors((errors) => [...errors, { errorName, errorElement }]);

      setTimeout(
        () =>
          setErrors((errors) =>
            errors.filter((err) => err.errorName !== errorName)
          ),

        4000
      );
    };
    const subscriptions: Subscription[] = [
      eventEmitter
        .observeEvent<JSX.Element>(events.userDeletionFailed)
        .subscribe(({ eventName, eventValue }) => {
          handleError(eventName, eventValue);
        }),
      eventEmitter
        .observeEvent<JSX.Element>(events.membershipDeleteFailed)
        .subscribe(({ eventName, eventValue }) => {
          handleError(eventName, eventValue);
        }),
      eventEmitter
        .observeEvent<JSX.Element>(events.membershipAddFailed)
        .subscribe(({ eventName, eventValue }) => {
          handleError(eventName, eventValue);
        }),
      eventEmitter
        .observeEvent<JSX.Element>(events.userRoleChangeFailed)
        .subscribe(({ eventName, eventValue }) => {
          handleError(eventName, eventValue);
        }),
    ];

    return () =>
      subscriptions.forEach((subscription) => subscription.unsubscribe());
  }, []);

  useEffect(() => {
    setSelectedUsers('none');
    setErrors([]);
  }, [groupId]);

  const toggleAllUsers = () => {
    setSelectedUsers((selectedUsers) => {
      return selectedUsers === 'all' ? 'none' : 'all';
    });
  };

  const unselectAllUsers = () => {
    setSelectedUsers('none');
  };

  const handleUserSelectedOnChange =
    (allUsersIds: string[]) => (userId: string) => {
      setSelectedUsers((selectedUsers) => {
        let newSelectedUsers: SelectedUsersType = 'none';

        if (isArray(selectedUsers)) {
          if (includes(selectedUsers, userId)) {
            const userIds = selectedUsers.filter((item) => item !== userId);
            newSelectedUsers = userIds.length > 0 ? userIds : 'none';
          } else {
            newSelectedUsers = [...selectedUsers, userId];
          }
        } else if (selectedUsers === 'none') {
          newSelectedUsers = [userId];
        } else if (isArray(allUsersIds)) {
          newSelectedUsers = allUsersIds
            .filter((user) => user !== userId)
            .map((user) => user);
        }

        return newSelectedUsers;
      });
    };

  if (isNil(users)) {
    return null;
  }

  if (!search && users.data.length === 0) {
    return (
      <Box mb="40px">
        <NoUsers groupType={groupType} />
      </Box>
    );
  }

  const allUsersIds = users.data.map((user) => user.id);

  return (
    <>
      <UserTableActions
        groupType={groupType}
        groupId={groupId}
        selectedUsers={selectedUsers}
        allUsersIds={allUsersIds}
        toggleSelectAll={toggleAllUsers}
        unselectAll={unselectAllUsers}
        deleteUsersFromGroup={deleteUsersFromGroup}
        onSearch={searchUser}
        usersDataLength={users.data.length}
      />

      {/* TODO: Fix this the next time the file is edited. */}
      {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
      {errors &&
        errors.length > 0 &&
        errors.map((err) => (
          <Error text={err.errorElement} key={err.errorName} />
        ))}

      {/* TODO: Fix this the next time the file is edited. */}
      {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
      {users?.data && users.data.length > 0 ? (
        <UserTable
          selectedUsers={selectedUsers}
          handleSelect={handleUserSelectedOnChange(allUsersIds)}
          notCitizenlabMember={notCitizenlabMember}
          usersList={users.data}
          currentPage={getPageNumberFromUrl(users.links.self) || 1}
          lastPage={getPageNumberFromUrl(users.links.last) || 1}
          onChangeSorting={setSort}
          sort={sort}
          onChangePage={setPageNumber}
        />
      ) : (
        <Box mb="40px">
          <NoUsers noSuchSearchResult={true} />
        </Box>
      )}
    </>
  );
};

export default UserManager;

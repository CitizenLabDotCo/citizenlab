import React, { useState } from 'react';

import { IUserData } from 'api/users/types';
import useInfiniteUsers from 'api/users/useInfiniteUsers';
import useUserById from 'api/users/useUserById';

import BaseUserSelect from './BaseUserSelect';
import OptionLabel from './OptionLabel';
import { Option } from './typings';
import { optionIsUser } from './utils';

export interface Props {
  selectedUserId: string | null;
  placeholder?: string;
  id?: string;
  inputId?: string;
  // Exclude users that can moderate the project from selectable users.
  // We pass the projectId here.
  isNotProjectModeratorOfProjectId?: string;
  // Exclude users that can moderate the folder from selectable users.
  // We pass the folderId here.
  isNotFolderModeratorOfFolderId?: string;
  onChange: (user?: IUserData) => void;
}

const UserSelect = ({
  selectedUserId,
  placeholder,
  id,
  inputId,
  isNotFolderModeratorOfFolderId,
  isNotProjectModeratorOfProjectId,
  onChange,
}: Props) => {
  const [searchValue, setSearchValue] = useState('');
  const {
    data: users,
    isLoading,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteUsers({
    pageSize: 5,
    sort: 'last_name',
    is_not_folder_moderator: isNotFolderModeratorOfFolderId,
    is_not_project_moderator: isNotProjectModeratorOfProjectId,
    search: searchValue,
  });

  const usersList = users?.pages.flatMap((page) => page.data) ?? [];

  const { data: selectedUser } = useUserById(selectedUserId);

  const handleChange = (option?: Option) => {
    if (!option) {
      onChange(undefined);
      return;
    }

    if (optionIsUser(option)) onChange(option);
  };

  return (
    <BaseUserSelect
      id={id}
      inputId={inputId}
      // We check if selectedUserId is present because setting it to null won't trigger a refetch so will have old data.
      // I'm preferring this over refetching on clear because it's faster and avoids a fetch that we technically don't need.
      value={(selectedUserId && selectedUser?.data) || null}
      placeholder={placeholder}
      options={hasNextPage ? [...usersList, { value: 'loadMore' }] : usersList}
      getOptionLabel={(option) => (
        <OptionLabel
          option={option}
          hasNextPage={hasNextPage}
          isLoading={isLoading}
          fetchNextPage={() => fetchNextPage()}
        />
      )}
      onInputChange={setSearchValue}
      onMenuScrollToBottom={() => fetchNextPage()}
      onChange={handleChange}
      onMenuOpen={handleChange}
    />
  );
};

export default UserSelect;

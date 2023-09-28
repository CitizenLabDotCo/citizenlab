import React, { useState } from 'react';

// api
import useUserById from 'api/users/useUserById';
import useInfiniteUsers from 'api/users/useInfiniteUsers';

// components
import BaseUserSelect from './BaseUserSelect';
import { Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// utils
import { optionIsUser } from './utils';

// typings
import { Option } from './typings';
import { IUserData } from 'api/users/types';

interface Props {
  selectedUserId: string | null;
  placeholder: string;
  id: string;
  inputId: string;
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

  const handleChange = (option: Option, { action }) => {
    if (action === 'clear') {
      handleClear();
      return;
    }

    if (optionIsUser(option)) {
      onChange(option);
    } else {
      if (option.value === 'loadMore') {
        fetchNextPage();
      }
    }
  };

  const handleClear = () => {
    onChange();
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
      onMenuOpen={handleClear}
      onInputChange={setSearchValue}
      onMenuScrollToBottom={() => fetchNextPage()}
      onChange={handleChange}
    />
  );
};

interface OptionLabelProps {
  option: Option;
  hasNextPage?: boolean;
  isLoading: boolean;
  fetchNextPage: () => void;
}

const OptionLabel = ({
  option,
  hasNextPage,
  isLoading,
  fetchNextPage,
}: OptionLabelProps) => {
  if (optionIsUser(option)) {
    return (
      <Box
        display="flex"
        alignItems="center"
        data-cy={`e2e-user-${option.attributes.email}`}
      >
        {option.attributes.last_name}, {option.attributes.first_name} (
        {option.attributes.email})
      </Box>
    );
  }

  if (option.value === 'loadMore' && hasNextPage) {
    return (
      <Button
        onClick={fetchNextPage}
        processing={isLoading}
        icon="refresh"
        buttonStyle="text"
        padding="0px"
      />
    );
  }

  return null;
};

export default UserSelect;

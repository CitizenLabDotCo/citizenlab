import React, { useState, useMemo } from 'react';
import ReactSelect, { OptionTypeBase } from 'react-select';

// api
import useUserById from 'api/users/useUserById';
import useInfiniteUsers from 'api/users/useInfiniteUsers';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// styling
import selectStyles from 'components/UI/MultipleSelect/styles';
import styled from 'styled-components';

// utils
import { debounce } from 'lodash-es';
import { IUserData } from 'api/users/types';

export interface UserOptionTypeBase extends OptionTypeBase, IUserData {
  // If the option is 'load more' instead of a user, we don't have IUserData
  // but { value: 'loadMore' }
  value?: string;
}

interface Props {
  onChange: (user?: UserOptionTypeBase) => void;
  selectedUserId: string | null;
  placeholder: string;
  className?: string;
  id: string;
  inputId: string;
  // Exclude users that can moderate the project from selectable users.
  // We pass the projectId here.
  isNotProjectModeratorOfProjectId?: string;
  // Exclude users that can moderate the folder from selectable users.
  // We pass the folderId here.
  isNotFolderModeratorOfFolderId?: string;
}

const UserOption = styled.div`
  display: flex;
  align-items: center;
`;

const UserSelect = ({
  onChange,
  selectedUserId,
  placeholder,
  className,
  id,
  inputId,
  isNotFolderModeratorOfFolderId,
  isNotProjectModeratorOfProjectId,
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

  const handleChange = (option: UserOptionTypeBase, { action }) => {
    if (action === 'clear') {
      handleClear();
    } else if (action === 'select-option' && option.value !== 'loadMore') {
      onChange(option);
    } else if (action === 'select-option' && option.value === 'loadMore') {
      fetchNextPage();
    }
  };

  const handleInputChange = useMemo(() => {
    return debounce((searchTerm) => {
      setSearchValue(searchTerm);
    }, 500);
  }, []);

  const handleMenuScrollToBottom = () => {
    fetchNextPage();
  };

  const handleClear = () => {
    onChange();
  };

  const getOptionId = (option: UserOptionTypeBase) => option.id;

  return (
    <Box data-cy="e2e-user-select">
      <ReactSelect
        id={id}
        inputId={inputId}
        className={className}
        isSearchable
        blurInputOnSelect
        backspaceRemovesValue={false}
        menuShouldScrollIntoView={false}
        isClearable
        // We check if selectedUserId is present because setting it to null won't trigger a refetch so will have old data. I'm preferring this over refetching on clear because it's faster and avoids a fetch that we technically don't need.
        value={(selectedUserId && selectedUser?.data) || null}
        placeholder={placeholder}
        options={
          hasNextPage ? [...usersList, { value: 'loadMore' }] : usersList
        }
        getOptionValue={getOptionId}
        getOptionLabel={(option) => (
          <OptionLabel
            option={option}
            hasNextPage={hasNextPage}
            isLoading={isLoading}
            fetchNextPage={() => fetchNextPage()}
          />
        )}
        onChange={handleChange}
        onInputChange={handleInputChange}
        menuPlacement="auto"
        styles={selectStyles}
        onMenuScrollToBottom={handleMenuScrollToBottom}
        filterOption={() => true}
        onMenuOpen={handleClear}
      />
    </Box>
  );
};

interface OptionLabelProps {
  option: UserOptionTypeBase;
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
  } else if (option.attributes) {
    return (
      <UserOption data-cy={`e2e-user-${option.attributes.email}`}>
        {option.attributes.last_name}, {option.attributes.first_name} (
        {option.attributes.email})
      </UserOption>
    );
  }

  return null;
};

export default UserSelect;

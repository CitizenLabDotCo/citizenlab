import React from 'react';
import { adopt } from 'react-adopt';
import GetUsers, { GetUsersChildProps } from 'resources/GetUsers';
import ReactSelect, { OptionTypeBase } from 'react-select';
import selectStyles from 'components/UI/MultipleSelect/styles';
import { Box } from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';
import styled from 'styled-components';
import { IUserData } from 'api/users/types';
import Button from 'components/UI/Button';
import useUserById from 'api/users/useUserById';

interface DataProps {
  users: GetUsersChildProps;
}

export interface UserOptionTypeBase extends OptionTypeBase, IUserData {
  // If the option is 'load more' instead of a user, we don't have IUserData
  // but { value: 'loadMore' }
  value?: string;
}

interface InputProps {
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

interface Props extends DataProps, InputProps {}

const UserOption = styled.div`
  display: flex;
  align-items: center;
`;

const UserSelect = ({
  users,
  onChange,
  selectedUserId,
  placeholder,
  className,
  id,
  inputId,
}: DataProps & Props) => {
  const canLoadMore = users.hasNextPage;
  const usersList = Array.isArray(users.usersList) ? users.usersList : [];
  const { data: selectedUser } = useUserById(selectedUserId);

  const handleChange = (option: UserOptionTypeBase, { action }) => {
    if (action === 'clear') {
      handleClear();
    } else if (action === 'select-option' && option.value !== 'loadMore') {
      onChange(option);
    } else if (action === 'select-option' && option.value === 'loadMore') {
      handleLoadMore();
    }
  };

  const handleInputChange = debounce((searchTerm) => {
    users.onChangeSearchTerm(searchTerm);
  }, 500);

  const handleMenuScrollToBottom = () => {
    handleLoadMore();
  };

  const handleLoadMore = () => {
    users.onLoadMore();
  };

  const handleClear = () => {
    onChange();
  };

  const getOptionLabel = (option: UserOptionTypeBase) => {
    if (option.value === 'loadMore' && canLoadMore) {
      return (
        <Button
          onClick={handleLoadMore}
          processing={users.isLoading}
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
        value={selectedUser}
        placeholder={placeholder}
        options={
          canLoadMore ? [...usersList, { value: 'loadMore' }] : usersList
        }
        getOptionValue={getOptionId}
        getOptionLabel={getOptionLabel}
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

const Data = adopt<DataProps, InputProps>({
  users: ({
    isNotProjectModeratorOfProjectId,
    isNotFolderModeratorOfFolderId,
    render,
  }) => (
    <GetUsers
      pageSize={5}
      sort="last_name"
      is_not_project_moderator={isNotProjectModeratorOfProjectId}
      is_not_folder_moderator={isNotFolderModeratorOfFolderId}
    >
      {render}
    </GetUsers>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps: DataProps) => <UserSelect {...dataProps} {...inputProps} />}
  </Data>
);

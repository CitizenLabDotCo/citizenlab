import React, { useState } from 'react';

// api
import useUserById from 'api/users/useUserById';
import useInfiniteUsers from 'api/users/useInfiniteUsers';

// styling
import { colors } from 'utils/styleUtils';

// components
import BaseUserSelect from 'components/UI/UserSelect/BaseUserSelect';
import { Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// utils
import { optionIsUser } from 'components/UI/UserSelect/utils';

// typings
import { Option } from 'components/UI/UserSelect/typings';
import { IUserData } from 'api/users/types';

interface Props {
  selectedUserId: string | null;
  placeholder: string;
  id: string;
  inputId: string;
  onChange: (user?: IUserData) => void;
  onCreateUser: (email: string) => void;
}

const AuthorSelect = ({
  selectedUserId,
  placeholder,
  id,
  inputId,
  onChange,
  onCreateUser,
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
    search: searchValue,
  });

  const usersList = users?.pages.flatMap((page) => page.data) ?? [];

  const { data: selectedUser } = useUserById(selectedUserId);

  const handleChange = (
    option: Option,
    { action }: { action: 'clear' | 'select-option' }
  ) => {
    if (action === 'clear') {
      handleClear();
      return;
    }

    if (optionIsUser(option)) {
      onChange(option);
    }
  };

  const handleClear = () => {
    onChange();
  };

  const options = [
    { value: 'newUser' },
    ...usersList,
    ...(hasNextPage ? [{ value: 'loadMore' }] : []),
  ];

  return (
    <BaseUserSelect
      id={id}
      inputId={inputId}
      // We check if selectedUserId is present because setting it to null won't trigger a refetch so will have old data.
      // I'm preferring this over refetching on clear because it's faster and avoids a fetch that we technically don't need.
      value={(selectedUserId && selectedUser?.data) || null}
      placeholder={placeholder}
      options={options}
      getOptionLabel={(option) => (
        <OptionLabel
          searchValue={searchValue}
          option={option}
          hasNextPage={hasNextPage}
          isLoading={isLoading}
          fetchNextPage={() => fetchNextPage()}
          onCreateUser={onCreateUser}
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
  searchValue: string;
  option: Option;
  hasNextPage?: boolean;
  isLoading: boolean;
  fetchNextPage: () => void;
  onCreateUser: (email: string) => void;
}

const OptionLabel = ({
  searchValue,
  option,
  hasNextPage,
  isLoading,
  fetchNextPage,
  onCreateUser,
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

  if (option.value === 'newUser') {
    return (
      <Button
        bgColor={colors.green100}
        icon="user"
        buttonStyle="text"
        padding="0px"
        margin="0px"
        onClick={() => onCreateUser(searchValue)}
      >
        New user
      </Button>
    );
  }

  return null;
};

export default AuthorSelect;

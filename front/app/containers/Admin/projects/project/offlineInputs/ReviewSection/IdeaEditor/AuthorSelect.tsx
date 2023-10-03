import React, { useState } from 'react';

// api
import useInfiniteUsers from 'api/users/useInfiniteUsers';
import useUserById from 'api/users/useUserById';

// components
import BaseUserSelect from 'components/UI/UserSelect/BaseUserSelect';
import OptionLabel from 'components/UI/UserSelect/OptionLabel';

// typings
import { IUserData } from 'api/users/types';

interface Props {
  selectedUserId?: string;
  onChange: (user?: IUserData) => void;
}

const AuthorSelect = ({ selectedUserId, onChange }: Props) => {
  const [searchValue, setSearchValue] = useState('');
  const {
    data: users,
    isLoading,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteUsers({
    pageSize: 5,
    sort: 'email',
    search: searchValue,
  });

  const usersList = users?.pages.flatMap((page) => page.data) ?? [];

  const { data: selectedUser } = useUserById(selectedUserId);

  return (
    <BaseUserSelect
      value={(selectedUserId && selectedUser?.data) || null}
      placeholder={'Placeholder'}
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
      onChange={onChange}
      onMenuOpen={onChange}
    />
  );
};

export default AuthorSelect;

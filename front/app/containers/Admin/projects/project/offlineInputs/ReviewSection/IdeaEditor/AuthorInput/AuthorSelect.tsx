import React, { useMemo, useState } from 'react';

// api
import useInfiniteUsers from 'api/users/useInfiniteUsers';
import useUserById from 'api/users/useUserById';

// components
import BaseUserSelect from 'components/UI/UserSelect/BaseUserSelect';
import OptionLabel from 'components/UI/UserSelect/OptionLabel';
import CustomOption from './CustomOption';

// utils
import { optionIsUser } from 'components/UI/UserSelect/utils';

// typings
import { SelectedAuthor } from './typings';
import { Option } from 'components/UI/UserSelect/typings';

interface Props {
  selectedAuthor: SelectedAuthor;
  onSelect: (selectedAuthor?: SelectedAuthor) => void;
}

const AuthorSelect = ({ selectedAuthor, onSelect }: Props) => {
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

  const options = useMemo(() => {
    return [
      { value: 'newUser', payload: searchValue },
      ...(users?.pages.flatMap((page) => page.data) ?? []),
      ...(hasNextPage ? [{ value: 'loadMore' }] : []),
    ];
  }, [searchValue, users, hasNextPage]);

  const { data: selectedUser } = useUserById(selectedAuthor?.id);

  const handleSelectExistingUser = (option?: Option) => {
    if (!option) return;

    if (optionIsUser(option)) {
      onSelect({
        user_state: 'existing-user',
        email: option.attributes.email,
        id: option.id,
      });
      return;
    }

    if (option.value === 'newUser') {
      onSelect({
        user_state: 'new-user',
        email: option.payload,
      });
    }
  };

  return (
    <BaseUserSelect
      value={selectedUser?.data ?? null}
      placeholder={'Enter an email address'}
      options={options}
      components={{ Option: CustomOption }}
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
      onChange={handleSelectExistingUser}
    />
  );
};

export default AuthorSelect;

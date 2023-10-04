import React, { useMemo } from 'react';

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
  selectedAuthor?: SelectedAuthor;
  onSelect: (selectedAuthor?: SelectedAuthor) => void;
  onSearch: (searchTerm: string) => void;
}

const AuthorSelect = ({ selectedAuthor, onSelect, onSearch }: Props) => {
  const searchValue = selectedAuthor?.email;

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

  const { data: selectedUser } = useUserById(
    selectedAuthor?.newUser ? undefined : selectedAuthor?.id
  );

  const handleSelectExistingUser = (option?: Option) => {
    if (!option) return;

    if (optionIsUser(option)) {
      onSelect({
        newUser: false,
        email: option.attributes.email,
        id: option.id,
      });
      return;
    }

    if (option.value === 'newUser') {
      onSelect({
        newUser: true,
        email: option.payload,
      });
    }
  };

  return (
    <BaseUserSelect
      value={selectedUser?.data ?? null}
      inputValue={searchValue}
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
      onInputChange={onSearch}
      onMenuScrollToBottom={() => fetchNextPage()}
      onChange={handleSelectExistingUser}
      onMenuOpen={onSelect}
    />
  );
};

export default AuthorSelect;

import React, { useMemo, useState } from 'react';

import useInfiniteUsers from 'api/users/useInfiniteUsers';

import BaseUserSelect from 'components/UI/UserSelect/BaseUserSelect';
import OptionLabel from 'components/UI/UserSelect/OptionLabel';
import { Option } from 'components/UI/UserSelect/typings';
import { optionIsUser } from 'components/UI/UserSelect/utils';

import CustomOption from './CustomOption';
import { SelectedAuthor } from './typings';

interface Props {
  selectedAuthor: SelectedAuthor;
  onSelect: (selectedAuthor?: SelectedAuthor) => void;
}

const AuthorSelect = ({ onSelect }: Props) => {
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
        user_state: 'new-imported-user',
        email: option.payload,
      });
    }
  };

  return (
    <BaseUserSelect
      value={null}
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

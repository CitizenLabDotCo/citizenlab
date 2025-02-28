import React from 'react';

import SearchInput from 'components/UI/SearchInput';

import { useRansackParam, setRansackParam } from '../utils';

const Search = () => {
  const value = useRansackParam(
    'q[title_en_or_description_en_or_tenant_name_cont]'
  );

  return (
    <SearchInput
      defaultValue={value}
      onChange={(search) => {
        setRansackParam(
          'q[title_en_or_description_en_or_tenant_name_cont]',
          search ?? undefined
        );
      }}
      a11y_numberOfSearchResults={0}
      placeholder="Search"
    />
  );
};

export default Search;

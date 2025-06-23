import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';

import SearchInput from 'components/UI/SearchInput';

interface Props {
  value?: string;
  placeholder: string;
  onChange: (value: string | undefined) => void;
}

const Search = ({ value, placeholder, onChange }: Props) => {
  return (
    <SearchInput
      defaultValue={value}
      onChange={(search) => {
        onChange(search ?? undefined);
      }}
      a11y_numberOfSearchResults={0}
      placeholder={placeholder}
      labelColor={colors.grey600}
    />
  );
};

export default Search;

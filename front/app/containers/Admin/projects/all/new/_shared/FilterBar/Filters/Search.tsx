import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';

import SearchInput from 'components/UI/SearchInput';

import { trackEventByName } from 'utils/analytics';

import { useParam, setParam } from '../../params';

import tracks from './tracks';

interface Props {
  placeholder: string;
}

const Search = ({ placeholder }: Props) => {
  const searchValue = useParam('search');

  return (
    <SearchInput
      defaultValue={searchValue}
      onChange={(search) => {
        setParam('search', search ?? undefined);
        trackEventByName(tracks.setSearch, { search });
      }}
      a11y_numberOfSearchResults={0}
      placeholder={placeholder}
      labelColor={colors.grey600}
    />
  );
};

export default Search;

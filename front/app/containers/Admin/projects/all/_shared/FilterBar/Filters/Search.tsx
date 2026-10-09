import React, { useEffect, useRef, useState } from 'react';

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
  const lastTypedValue = useRef(searchValue);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (!searchValue && lastTypedValue.current) {
      lastTypedValue.current = undefined;
      setResetKey((key) => key + 1);
    }
  }, [searchValue]);

  return (
    <SearchInput
      key={resetKey}
      defaultValue={searchValue}
      onChange={(search) => {
        lastTypedValue.current = search ?? undefined;
        setParam('search', search ?? undefined);
        trackEventByName(tracks.setSearch, { search });
      }}
      a11y_numberOfSearchResults={0}
      placeholder={placeholder}
      labelColor={colors.textPrimary}
      size="small"
      hideLabel
      dataCy="projects-overview-search-input"
    />
  );
};

export default Search;

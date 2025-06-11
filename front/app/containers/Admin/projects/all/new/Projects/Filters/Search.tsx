import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';

import SearchInput from 'components/UI/SearchInput';

import { useIntl } from 'utils/cl-intl';

import { setParam, useParam } from '../utils';

import messages from './messages';

const Search = () => {
  const { formatMessage } = useIntl();
  const value = useParam('search') ?? undefined;

  return (
    <SearchInput
      defaultValue={value}
      onChange={(search) => {
        setParam('search', search ?? undefined);
      }}
      a11y_numberOfSearchResults={0}
      placeholder={formatMessage(messages.search)}
      labelColor={colors.black}
    />
  );
};

export default Search;

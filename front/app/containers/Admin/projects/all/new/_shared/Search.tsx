import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';

import SearchInput from 'components/UI/SearchInput';

import { useIntl } from 'utils/cl-intl';

import messages from '../Projects/Filters/messages';

interface Props {
  value?: string;
  onChange: (value: string | undefined) => void;
}

const Search = ({ value, onChange }: Props) => {
  const { formatMessage } = useIntl();
  // const value = useParam('search') ?? undefined;

  return (
    <SearchInput
      // defaultValue={value}
      // onChange={(search) => {
      //   setParam('search', search ?? undefined);
      // }}
      defaultValue={value}
      onChange={(search) => {
        onChange(search ?? undefined);
      }}
      a11y_numberOfSearchResults={0}
      placeholder={formatMessage(messages.search)}
      labelColor={colors.grey600}
    />
  );
};

export default Search;

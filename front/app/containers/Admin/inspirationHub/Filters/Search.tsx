import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';

import SearchInput from 'components/UI/SearchInput';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import { useRansackParam, setRansackParam } from '../utils';

import messages from './messages';
import tracks from './tracks';

const Search = () => {
  const { formatMessage } = useIntl();
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
        trackEventByName(tracks.setSearch, { search });
      }}
      a11y_numberOfSearchResults={0}
      placeholder={formatMessage(messages.search)}
      labelColor={colors.black}
    />
  );
};

export default Search;

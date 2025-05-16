import React, { useMemo } from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';

import SearchInput from 'components/UI/SearchInput';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import { useRansackParam, setRansackParam } from '../utils';

import messages from './messages';
import tracks from './tracks';

const Search = () => {
  const { formatMessage } = useIntl();
  const value = useRansackParam(
    'q[title_en_or_description_en_or_tenant_name_or_title_multiloc_text_cont]'
  );

  const trackSearchEvent = useMemo(() => {
    return debounce((search: string) => {
      trackEventByName(tracks.setSearch, { search });
    }, 2500);
  }, []);

  return (
    <SearchInput
      defaultValue={value}
      onChange={(search) => {
        setRansackParam(
          'q[title_en_or_description_en_or_tenant_name_or_title_multiloc_text_cont]',
          search ?? undefined
        );

        if (search) {
          trackSearchEvent(search);
        }
      }}
      a11y_numberOfSearchResults={0}
      placeholder={formatMessage(messages.search)}
      labelColor={colors.black}
    />
  );
};

export default Search;

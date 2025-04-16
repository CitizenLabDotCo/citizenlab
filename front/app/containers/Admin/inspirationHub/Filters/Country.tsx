import React from 'react';

import useProjectLibraryCountries from 'api/project_library_countries/useProjectLibraryCountries';

import FilterSelector from 'components/FilterSelector';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import { setRansackParam, useRansackParam } from '../utils';

import messages from './messages';
import tracks from './tracks';

const Country = () => {
  const values = useRansackParam('q[tenant_country_code_in]');
  const { formatMessage } = useIntl();

  const { data: countries } = useProjectLibraryCountries();

  const options = countries?.data.attributes.map(
    ({ code, name, emoji_flag }) => ({
      value: code,
      text: `${emoji_flag} ${name}`,
    })
  );

  return (
    <FilterSelector
      multipleSelectionAllowed
      selected={values ?? []}
      values={options ?? []}
      title={formatMessage(messages.country)}
      name="country-select"
      ml="12px"
      mr="0px"
      onChange={(countryCodes) => {
        setRansackParam('q[tenant_country_code_in]', countryCodes);
        trackEventByName(tracks.setCountry, {
          country_codes: JSON.stringify(countryCodes),
        });
      }}
    />
  );
};

export default Country;

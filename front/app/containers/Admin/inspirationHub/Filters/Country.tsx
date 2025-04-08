import React from 'react';

import useProjectLibraryCountries from 'api/project_library_countries/useProjectLibraryCountries';

import MultipleSelect from 'components/UI/MultipleSelect';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import { setRansackParam, useRansackParam } from '../utils';

import messages from './messages';
import tracks from './tracks';

const Country = () => {
  const value = useRansackParam('q[tenant_country_code_in]');
  const { formatMessage } = useIntl();

  const { data: countries } = useProjectLibraryCountries();

  const options = countries?.data.attributes.map(
    ({ code, name, emoji_flag }) => ({
      value: code,
      label: `${emoji_flag} ${name}`,
    })
  );

  return (
    <MultipleSelect
      value={value}
      options={options ?? []}
      placeholder={formatMessage(messages.country)}
      onChange={(options) => {
        const countryCodes = options.map((o) => o.value);
        setRansackParam('q[tenant_country_code_in]', countryCodes);
        trackEventByName(tracks.setCountry, {
          country_codes: JSON.stringify(countryCodes),
        });
      }}
    />
  );
};

export default Country;

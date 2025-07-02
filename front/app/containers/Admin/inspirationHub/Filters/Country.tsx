import React, { useEffect, useState } from 'react';

import useProjectLibraryCountries from 'api/project_library_countries/useProjectLibraryCountries';

import useCountryCodeSupportedInProjectLibrary from 'hooks/useCountryCodeSupportedInProjectLibrary';

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

const CountryWrapper = () => {
  const [initialCountryCodeSet, setInitialCountryCodeSet] = useState(false);
  const { status, countryCode } = useCountryCodeSupportedInProjectLibrary();

  useEffect(() => {
    if (initialCountryCodeSet) return;

    if (status === 'supported') {
      setRansackParam('q[tenant_country_code_in]', [countryCode]);
      setInitialCountryCodeSet(true);
    }
  }, [status, countryCode, initialCountryCodeSet]);

  if (status === 'loading') {
    return null;
  }

  // If the countryCode is supported, but the param is not set yet,
  // we wait for it to be set.
  if (status === 'supported' && !initialCountryCodeSet) {
    return null;
  }

  return <Country />;
};

export default CountryWrapper;

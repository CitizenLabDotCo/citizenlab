import React from 'react';

import { trackEventByName } from 'utils/analytics';

import CountryFilter from '../components/CountryFilter';
import { setRansackParam, useRansackParam } from '../utils';

import messages from './messages';
import tracks from './tracks';

const Country = () => {
  const value = useRansackParam('q[tenant_country_code_eq]');

  return (
    <CountryFilter
      value={value}
      placeholderMessage={messages.country}
      onChange={(option) => {
        setRansackParam('q[tenant_country_code_eq]', option.value);
        trackEventByName(tracks.setCountry, { country_code: option.value });
      }}
    />
  );
};

export default Country;

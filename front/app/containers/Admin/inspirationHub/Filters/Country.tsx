import React from 'react';

import CountryFilter from '../components/CountryFilter';
import { setRansackParam, useRansackParam } from '../utils';

import messages from './messages';

const Country = () => {
  const value = useRansackParam('q[tenant_country_alpha2_eq]');

  return (
    <CountryFilter
      value={value}
      placeholderMessage={messages.country}
      onChange={(option) => {
        setRansackParam('q[tenant_country_alpha2_eq]', option.value);
      }}
    />
  );
};

export default Country;

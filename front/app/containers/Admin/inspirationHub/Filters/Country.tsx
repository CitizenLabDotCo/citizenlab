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
      onChange={() => {
        setRansackParam('q[tenant_country_alpha2_eq]', value);
      }}
    />
  );
};

export default Country;

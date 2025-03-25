import React from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import CountryFilter from '../components/CountryFilter';
import { setRansackParam, useRansackParam } from '../utils';

import Cards from './Cards';
import messages from './messages';

const PinnedProjects = () => {
  const countryCode = useRansackParam('q[pin_country_code_eq]');

  return (
    <>
      <Title variant="h2" color="primary" mt="0px">
        <FormattedMessage {...messages.highlighted} />
      </Title>
      <Box display="flex" mb="12px">
        <CountryFilter
          value={countryCode}
          placeholderMessage={messages.country}
          onChange={(option) => {
            setRansackParam('q[pin_country_code_eq]', option.value);
          }}
        />
      </Box>
      <Cards />
    </>
  );
};

export default PinnedProjects;

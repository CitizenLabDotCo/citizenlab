import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../messages';

import Sort from './Sort';

const SortAndReset = () => {
  const { data: appConfiguration } = useAppConfiguration();
  if (!appConfiguration) return null;

  const countryCode = appConfiguration.data.attributes.country_code;

  return (
    <Box display="flex" mt="8px">
      <Sort />
      <Button
        buttonStyle="text"
        pl="0"
        ml="8px"
        onClick={() => {
          const search = countryCode
            ? `?q[tenant_country_alpha2_eq]=${countryCode}`
            : '';

          clHistory.replace({
            pathname: window.location.pathname,
            search,
          });
        }}
      >
        <FormattedMessage {...messages.resetFilters} />
      </Button>
    </Box>
  );
};

export default SortAndReset;

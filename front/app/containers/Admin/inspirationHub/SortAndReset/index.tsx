import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../messages';
import { useRansackParam } from '../utils';

import Sort from './Sort';

const SortAndReset = () => {
  const countryCode = useRansackParam('q[tenant_country_code_in]');

  return (
    <Box display="flex" mt="8px">
      <Sort />
      <Button
        buttonStyle="text"
        pl="0"
        ml="8px"
        onClick={() => {
          const search = countryCode
            ? `?q[tenant_country_code_in]=${JSON.stringify([countryCode])}`
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

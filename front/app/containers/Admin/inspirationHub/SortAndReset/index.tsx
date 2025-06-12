import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import messages from '../messages';
import { useRansackParam, clearRansackParams } from '../utils';

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
          clearRansackParams();

          if (countryCode) {
            updateSearchParams({ 'q[tenant_country_code_in]': countryCode });
          }
        }}
      >
        <FormattedMessage {...messages.resetFilters} />
      </Button>
    </Box>
  );
};

export default SortAndReset;

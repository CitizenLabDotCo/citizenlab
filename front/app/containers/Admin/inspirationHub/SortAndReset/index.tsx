import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';
import { clearRansackParams } from '../utils';

import Sort from './Sort';

const SortAndReset = () => {
  return (
    <Box display="flex" mt="8px">
      <Sort />
      <Button
        buttonStyle="text"
        pl="0"
        ml="8px"
        onClick={() => {
          clearRansackParams();
        }}
      >
        <FormattedMessage {...messages.resetFilters} />
      </Button>
    </Box>
  );
};

export default SortAndReset;

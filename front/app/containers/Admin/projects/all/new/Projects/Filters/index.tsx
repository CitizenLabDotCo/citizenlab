import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import Sort from './Sort';

const Filters = () => {
  return (
    <Box display="flex" alignItems="center" w="100%">
      <Sort />
    </Box>
  );
};

export default Filters;

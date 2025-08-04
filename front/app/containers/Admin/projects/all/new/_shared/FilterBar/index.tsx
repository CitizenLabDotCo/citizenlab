import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import DynamicFilters from './DynamicFilters';
import Dates from './Filters/Dates';
import Sort from './Filters/Sort';

const Filters = () => {
  return (
    <Box
      display="flex"
      flexDirection="row"
      flexWrap="wrap"
      gap="8px"
      alignItems="center"
    >
      <Sort />
      <Dates />
      <DynamicFilters />
    </Box>
  );
};

export default Filters;

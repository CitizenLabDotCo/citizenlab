import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import Country from './Country';
import Dates from './Dates';
import Method from './Method';
import Population from './Population';
import Search from './Search';

const Filters = () => {
  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box display="flex" flexDirection="row" gap="12px" alignItems="center">
        <Country />
        <Method />
        <Population />
        <Dates />
      </Box>
      <Search />
    </Box>
  );
};

export default Filters;

import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import Country from './Country';
import Method from './Method';
import Search from './Search';
import Size from './Size';
import Status from './Status';

const Filters = () => {
  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box display="flex" flexDirection="row" gap="12px">
        <Country />
        <Method />
        <Size />
        <Status />
      </Box>
      <Search />
    </Box>
  );
};

export default Filters;

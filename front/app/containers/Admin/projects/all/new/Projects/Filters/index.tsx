import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import Dates from './Dates';
import Manager from './Manager';
import Search from './Search';
import Sort from './Sort';
import Status from './Status';

const Filters = () => {
  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box display="flex" alignItems="center" w="100%">
        <Sort />
        <Manager />
        <Status />
        <Dates />
      </Box>
      <Search />
    </Box>
  );
};

export default Filters;

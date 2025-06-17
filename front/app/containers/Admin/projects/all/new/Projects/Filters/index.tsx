import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import Manager from '../../_shared/Manager';
import Search from '../../_shared/Search';
import Status from '../../_shared/Status';

import Dates from './Dates';
import Sort from './Sort';

const Filters = () => {
  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box display="flex" alignItems="center" w="100%">
        <Sort mr="12px" />
        <Manager />
        <Status mr="8px" />
        <Dates />
      </Box>
      <Search />
    </Box>
  );
};

export default Filters;

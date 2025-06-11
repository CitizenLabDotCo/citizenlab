import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import Manager from './Manager';
import Sort from './Sort';
import Status from './Status';

const Filters = () => {
  return (
    <Box display="flex" alignItems="center" w="100%">
      <Sort />
      <Manager />
      <Status />
    </Box>
  );
};

export default Filters;

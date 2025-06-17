import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import Manager from '../../_shared/Manager';
import Status from '../../_shared/Status';

// import Search from './Search';

const Filters = () => {
  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Box display="flex" alignItems="center" w="100%">
        <Manager mr="8px" />
        <Status mr="8px" />
      </Box>
      {/* <Search /> */}
    </Box>
  );
};

export default Filters;

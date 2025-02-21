import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import Method from './Method';
import Size from './Size';
import Status from './Status';

const Filters = () => {
  return (
    <Box display="flex" flexDirection="row" gap="20px">
      <Method />
      <Size />
      <Status />
    </Box>
  );
};

export default Filters;

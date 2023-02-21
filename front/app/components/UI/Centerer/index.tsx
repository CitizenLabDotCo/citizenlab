import React from 'react';

import { Box, BoxProps } from '@citizenlab/cl2-component-library';

const Centerer = (props: BoxProps) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="center"
    width="100%"
    {...props}
  />
);

export default Centerer;

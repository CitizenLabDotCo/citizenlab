import React from 'react';

// components
import { Box, BoxProps } from '@citizenlab/cl2-component-library';

const Body = ({ children, ...otherProps }: BoxProps) => (
  <Box as="tbody" {...otherProps}>
    {children}
  </Box>
);

export default Body;

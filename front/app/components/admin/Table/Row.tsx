import React from 'react';

// components
import { Box, BoxProps } from '@citizenlab/cl2-component-library';

const Row = ({ children, ...otherProps }: BoxProps) => (
  <Box as="tr" {...otherProps}>
    {children}
  </Box>
);

export default Row;

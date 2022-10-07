import React from 'react';

// components
import { Box, BoxProps } from '@citizenlab/cl2-component-library';

const Cell = ({ children, ...otherProps }: BoxProps) => (
  <Box as="td" {...otherProps}>
    {children}
  </Box>
);

export default Cell;

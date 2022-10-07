import React from 'react';

// components
import { Box, BoxProps } from '@citizenlab/cl2-component-library';

const HeaderCell = ({ children, ...otherProps }: BoxProps) => (
  <Box as="th" {...otherProps}>
    {children}
  </Box>
);

export default HeaderCell;

import React from 'react';

// components
import { Box, BoxProps } from '@citizenlab/cl2-component-library';

interface Props extends BoxProps {
  colSpan?: number;
}

const Td = ({ children, colSpan, ...otherProps }: Props) => (
  <Box as="td" p="12px" colSpan={colSpan} {...otherProps}>
    {children}
  </Box>
);

export default Td;

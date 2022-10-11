import React from 'react';

// components
import { Box, BoxProps } from '@citizenlab/cl2-component-library';

interface Props extends BoxProps {
  colSpan?: `${number}`;
}

const HeaderCell = ({ children, colSpan, ...otherProps }: Props) => (
  <Box as="th" p="12px" colSpan={colSpan as any} {...otherProps}>
    {children}
  </Box>
);

export default HeaderCell;

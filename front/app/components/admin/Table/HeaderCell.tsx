import React from 'react';

// components
import { Box, BoxProps } from '@citizenlab/cl2-component-library';

// styling
import { SEMANTIC_UI_BORDER_INNER_COLOR } from './constants';

const HeaderCell = ({ children, ...otherProps }: BoxProps) => (
  <Box
    as="th"
    borderBottom={`1px solid ${SEMANTIC_UI_BORDER_INNER_COLOR}`}
    {...otherProps}
  >
    {children}
  </Box>
);

export default HeaderCell;

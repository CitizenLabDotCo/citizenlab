import React from 'react';

// components
import { Box, BoxProps } from '@citizenlab/cl2-component-library';

// styling
import { SEMANTIC_UI_HEADER_BG_COLOR } from './constants';

const Header = ({ children, ...otherProps }: BoxProps) => (
  <Box as="thead" background={SEMANTIC_UI_HEADER_BG_COLOR} {...otherProps}>
    {children}
  </Box>
);

export default Header;

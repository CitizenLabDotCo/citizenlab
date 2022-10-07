import React from 'react';

// components
import { Box, BoxProps } from '@citizenlab/cl2-component-library';

const Footer = ({ children, ...otherProps }: BoxProps) => (
  <Box as="tfoot" {...otherProps}>
    {children}
  </Box>
);

export default Footer;

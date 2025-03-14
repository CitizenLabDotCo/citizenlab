import React from 'react';

import { colors } from 'component-library/utils/styleUtils';

import Box, { BoxProps } from '../Box';

const Quote = ({ children, ...props }: BoxProps) => {
  return (
    <Box as="blockquote" bgColor={colors.teal50} p="12px" {...props}>
      {children}
    </Box>
  );
};

export default Quote;

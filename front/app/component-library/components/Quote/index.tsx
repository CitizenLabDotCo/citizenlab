import React from 'react';

import { colors, stylingConsts } from '../../utils/styleUtils';
import Box, { BoxProps } from '../Box';
import Icon from '../Icon';

const Quote = ({ children, ...props }: BoxProps) => {
  return (
    <Box
      as="blockquote"
      bgColor={colors.teal50}
      p="12px"
      borderRadius={stylingConsts.borderRadius}
      position="relative"
      margin="0"
      {...props}
    >
      <Icon
        name="quote"
        position="absolute"
        top="8px"
        right="12px"
        height="16px"
        fill={colors.teal100}
      />
      <Box>{children}</Box>
    </Box>
  );
};

export default Quote;

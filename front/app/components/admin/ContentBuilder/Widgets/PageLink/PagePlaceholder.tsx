import React, { ReactNode } from 'react';

import {
  Box,
  colors,
  Icon,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

interface Props {
  variant?: 'error';
  children: ReactNode;
}

// Builder stand-in when no page is selected, or the selection can't resolve
// (`error` variant).
const PagePlaceholder = ({ variant, children }: Props) => {
  const color = variant === 'error' ? colors.error : colors.textSecondary;

  return (
    <Box
      display="flex"
      alignItems="center"
      gap="15px"
      color={color}
      border={`1px solid ${colors.borderLight}`}
      borderRadius={stylingConsts.borderRadius}
      px="20px"
      py="10px"
      mb="10px"
    >
      <Icon name="file" fill={color} width="20px" height="20px" />
      {children}
    </Box>
  );
};

export default PagePlaceholder;

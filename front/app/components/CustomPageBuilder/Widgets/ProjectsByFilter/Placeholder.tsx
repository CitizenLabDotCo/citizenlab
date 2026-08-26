import React, { ReactNode } from 'react';

import {
  Box,
  colors,
  Icon,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

interface Props {
  children: ReactNode;
}

// Builder stand-in for a widget that has nothing to render yet. Never shown in the front
// office, where an unconfigured widget renders nothing at all.
const Placeholder = ({ children }: Props) => (
  <Box
    display="flex"
    alignItems="center"
    gap="15px"
    color={colors.textSecondary}
    border={`1px solid ${colors.borderLight}`}
    borderRadius={stylingConsts.borderRadius}
    px="20px"
    py="10px"
  >
    <Icon
      name="projects"
      fill={colors.textSecondary}
      width="20px"
      height="20px"
    />
    {children}
  </Box>
);

export default Placeholder;

import React from 'react';

import { Box, colors, stylingConsts } from '@citizenlab/cl2-component-library';

interface Props {
  id?: string;
  children: React.ReactNode;
  zIndex?: string;
}

const Container = ({ id, children, zIndex = '3' }: Props) => (
  <Box
    id={id}
    position="fixed"
    zIndex={zIndex}
    alignItems="center"
    w="100%"
    h={`${stylingConsts.menuHeight}px`}
    display="flex"
    background={`${colors.white}`}
    borderBottom={`1px solid ${colors.grey500}`}
  >
    {children}
  </Box>
);

export default Container;

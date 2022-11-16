import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// stying
import { colors, stylingConsts } from 'utils/styleUtils';

interface Props {
  children: React.ReactNode;
}

const Container = ({ children }: Props) => (
  <Box
    position="fixed"
    zIndex="3"
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

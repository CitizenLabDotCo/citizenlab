import React from 'react';

// components
import { Box, stylingConsts } from '@citizenlab/cl2-component-library';

// styling
import { colors } from 'utils/styleUtils';

interface Props {
  children: React.ReactNode;
}

const Container = ({ children }: Props) => (
  <Box
    position="fixed"
    zIndex="99999"
    flex="0 0 auto"
    h={`calc(100vh - ${stylingConsts.menuHeight}px)`}
    w="210px"
    display="flex"
    flexDirection="column"
    alignItems="center"
    bgColor="#ffffff"
    overflowY="auto"
    borderRight={`1px solid ${colors.grey500}`}
  >
    <Box w="100%" display="inline" pb="20px">
      {children}
    </Box>
  </Box>
);

export default Container;

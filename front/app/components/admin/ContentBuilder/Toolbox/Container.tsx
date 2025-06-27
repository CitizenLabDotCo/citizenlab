import React from 'react';

import {
  Box,
  stylingConsts,
  colors,
  BoxProps,
} from '@citizenlab/cl2-component-library';

type Props = {
  children: React.ReactNode;
} & BoxProps;

const Container = ({ children, ...rest }: Props) => (
  <Box
    position="fixed"
    zIndex="99999"
    flex="0 0 auto"
    h={`calc(100vh - ${stylingConsts.menuHeight}px)`}
    w="236px"
    display="flex"
    flexDirection="column"
    alignItems="center"
    bgColor="#ffffff"
    overflowY="auto"
    borderRight={`1px solid ${colors.grey500}`}
    {...rest}
  >
    <Box w="100%" display="inline" pb="20px">
      {children}
    </Box>
  </Box>
);

export default Container;

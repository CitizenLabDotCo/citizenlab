import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

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
    h="100%"
    w="210px"
    display="flex"
    flexDirection="column"
    alignItems="center"
    bgColor="#ffffff"
    overflowY="auto"
    borderRight={`1px solid ${colors.grey500}`}
  >
    <Box w="100%" display="inline">
      {children}
    </Box>
  </Box>
);

export default Container;

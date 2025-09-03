import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

const PageEsriDivider = ({
  dragDividerRef,
}: {
  dragDividerRef: React.RefObject<HTMLDivElement>;
}) => {
  return (
    <Box
      aria-hidden={true}
      height="30px"
      py="20px"
      ref={dragDividerRef}
      position="absolute"
      background={colors.white}
      w="100%"
      zIndex="1000"
    >
      <Box
        mx="auto"
        w="40px"
        h="4px"
        bgColor={colors.grey400}
        borderRadius="10px"
      />
    </Box>
  );
};

export default PageEsriDivider;

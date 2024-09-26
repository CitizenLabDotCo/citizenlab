import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

const EDGE_WIDTH = 16;

const Edge = () => {
  return (
    <Box
      w={`${EDGE_WIDTH}px`}
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      <Arrow width={EDGE_WIDTH} />
    </Box>
  );
};

export default Edge;

const Arrow = ({ width }: { width: number }) => {
  return (
    <svg
      width={width.toString()}
      height="12"
      viewBox="0 0 18 7"
      fill={colors.blue700}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18 3.5L13 0.613249V6.38675L18 3.5ZM0 4H13.5V3H0V4Z"
        fill="#044D6C"
      />
    </svg>
  );
};

import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

const SkeletonDot = ({ size = '20px' }: { size?: string }) => (
  <Box
    flex="0 0 auto"
    width={size}
    height={size}
    background={colors.grey200}
    borderRadius="50%"
  />
);

export default SkeletonDot;

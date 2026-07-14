import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

type Props = {
  width?: string;
  height?: string;
};

const SkeletonBar = ({ width = '100%', height = '12px' }: Props) => (
  <Box
    width={width}
    height={height}
    background={colors.grey200}
    borderRadius="4px"
  />
);

export default SkeletonBar;

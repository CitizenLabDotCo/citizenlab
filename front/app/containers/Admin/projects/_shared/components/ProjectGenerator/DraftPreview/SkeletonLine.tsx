import React from 'react';

import { Box, Shimmer, bo, colors } from '@citizenlab/cl2-component-library';

type Props = {
  working: boolean;
  width: string;
  height: string;
};

const SkeletonLine = ({ working, width, height }: Props) =>
  working ? (
    <Shimmer width={width} height={height} borderRadius={bo.borderRadius} />
  ) : (
    <Box
      width={width}
      height={height}
      borderRadius={bo.borderRadius}
      bgColor={colors.grey200}
    />
  );

export default SkeletonLine;

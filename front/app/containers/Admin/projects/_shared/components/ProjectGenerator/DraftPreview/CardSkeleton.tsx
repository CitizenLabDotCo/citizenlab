import React from 'react';

import { Box, Text, bo, colors } from '@citizenlab/cl2-component-library';

import SkeletonLine from './SkeletonLine';

type Props = {
  working: boolean;
  caption: string;
};

const CardSkeleton = ({ working, caption }: Props) => (
  <Box
    display="flex"
    overflow="hidden"
    bgColor={colors.white}
    borderRadius={bo.panelBorderRadius}
    border={`1px dashed ${colors.grey400}`}
  >
    <Box width="200px" height="200px" flexShrink={0} bgColor={colors.grey100} />
    <Box flex="1" p="20px" display="flex" flexDirection="column" gap="12px">
      <SkeletonLine working={working} width="40%" height="12px" />
      <SkeletonLine working={working} width="70%" height="24px" />
      <SkeletonLine working={working} width="90%" height="12px" />
      <SkeletonLine working={working} width="80%" height="12px" />
      <Text m="0px" mt="auto" fontSize="s" color="textSecondary">
        {caption}
      </Text>
    </Box>
  </Box>
);

export default CardSkeleton;

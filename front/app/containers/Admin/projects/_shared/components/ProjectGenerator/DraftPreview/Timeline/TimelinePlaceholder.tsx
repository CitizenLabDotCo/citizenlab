import React from 'react';

import { Box, Text, bo, colors } from '@citizenlab/cl2-component-library';

import SkeletonLine from '../SkeletonLine';

type Props = {
  message?: string;
  working: boolean;
};

const TimelinePlaceholder = ({ message, working }: Props) => (
  <Box display="flex" flexDirection="column" gap="12px">
    {working && (
      <Box
        display="flex"
        gap="12px"
        p="16px"
        bgColor={colors.white}
        borderRadius={bo.panelBorderRadius}
        border={`1px dashed ${colors.grey400}`}
      >
        <SkeletonLine working width="36px" height="36px" />
        <Box flex="1" display="flex" flexDirection="column" gap="8px">
          <SkeletonLine working width="50%" height="14px" />
          <SkeletonLine working width="30%" height="12px" />
        </Box>
      </Box>
    )}
    {message && (
      <Text m="0px" color="textSecondary">
        {message}
      </Text>
    )}
  </Box>
);

export default TimelinePlaceholder;

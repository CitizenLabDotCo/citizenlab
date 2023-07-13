import React from 'react';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';

// styling
import { useTheme } from 'styled-components';
import { colors, stylingConsts } from 'utils/styleUtils';

interface Props {
  percentage: number;
  picks: number;
  baskets?: number;
}

const ProgressBar = ({ percentage, picks, baskets }: Props) => {
  const theme = useTheme();

  return (
    <Box
      w="100%"
      h="28px"
      borderRadius={stylingConsts.borderRadius}
      bgColor={colors.grey200}
      position="relative"
    >
      <Box
        w={`${percentage}%`}
        h="100%"
        bgColor={theme.colors.primary}
        borderRadius={stylingConsts.borderRadius}
      />
      <Box
        position="absolute"
        left="0"
        top="0"
        h="28px"
        display="flex"
        alignItems="center"
      >
        <Text m="0" color="white" ml="12px" fontSize="s">
          {/* {percentage}% */}
          {`${percentage}% (${picks} picks)`}
        </Text>
      </Box>
    </Box>
  );
};

export default ProgressBar;

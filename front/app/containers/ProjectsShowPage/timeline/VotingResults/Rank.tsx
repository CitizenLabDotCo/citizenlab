import React from 'react';

// components
import { Box, Text, BoxProps } from '@citizenlab/cl2-component-library';

// styling
import { stylingConsts } from 'utils/styleUtils';
import { useTheme } from 'styled-components';

interface Props {
  rank: number;
  position?: BoxProps['position'];
  top?: string;
  left?: string;
}

const Rank = ({ rank, position, top, left }: Props) => {
  const theme = useTheme();

  return (
    <Box
      position={position}
      top={top}
      left={left}
      bgColor={theme.colors.primary}
      borderRadius={stylingConsts.borderRadius}
      px="12px"
      py="4px"
    >
      <Text m="0" color="white" fontSize="xl" fontWeight="bold">
        #{rank}
      </Text>
    </Box>
  );
};

export default Rank;

import React from 'react';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';

// styling
import { stylingConsts } from 'utils/styleUtils';
import { useTheme } from 'styled-components';

interface Props {
  rank: number;
}

const Rank = ({ rank }: Props) => {
  const theme = useTheme();

  return (
    <Box
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

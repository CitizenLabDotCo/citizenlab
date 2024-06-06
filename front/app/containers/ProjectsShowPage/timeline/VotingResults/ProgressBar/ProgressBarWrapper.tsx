import React, { ReactNode } from 'react';

import {
  Box,
  Text,
  stylingConsts,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { transparentize } from 'polished';
import { useTheme } from 'styled-components';

interface Props {
  votesPercentage: number;
  children: ReactNode;
  tooltip: string;
}

const ProgressBarWrapper = ({ children, votesPercentage, tooltip }: Props) => {
  const theme = useTheme();

  return (
    <Tooltip disabled={false} content={tooltip} placement="bottom">
      <Box
        w="100%"
        h="28px"
        borderRadius={stylingConsts.borderRadius}
        bgColor={transparentize(0.9, theme.colors.tenantPrimary)}
        position="relative"
      >
        <Box
          w={`${votesPercentage}%`}
          h="100%"
          bgColor={transparentize(0.75, theme.colors.primary)}
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
          <Text
            m="0"
            color="tenantPrimary"
            ml="12px"
            fontSize="s"
            fontWeight="bold"
          >
            {children}
          </Text>
        </Box>
      </Box>
    </Tooltip>
  );
};

export default ProgressBarWrapper;

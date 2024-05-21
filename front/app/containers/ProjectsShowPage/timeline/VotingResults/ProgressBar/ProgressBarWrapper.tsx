import React, { ReactNode } from 'react';

import {
  Box,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';

interface Props {
  votesPercentage: number;
  children: ReactNode;
  tooltip: string;
}

const ProgressBarWrapper = ({ children, votesPercentage, tooltip }: Props) => {
  return (
    <Tippy
      disabled={false}
      content={tooltip}
      interactive={true}
      placement="bottom"
    >
      <Box
        w="100%"
        h="28px"
        borderRadius={stylingConsts.borderRadius}
        bgColor={colors.coolGrey600}
        position="relative"
      >
        <Box
          w={`${votesPercentage}%`}
          h="100%"
          bgColor={colors.success}
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
          <Text m="0" color="white" ml="12px" fontSize="s" fontWeight="bold">
            {children}
          </Text>
        </Box>
      </Box>
    </Tippy>
  );
};

export default ProgressBarWrapper;

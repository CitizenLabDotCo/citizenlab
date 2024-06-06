import React, { ReactNode } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';
import { useTheme } from 'styled-components';

interface Props {
  votesPercentage: number;
  children: ReactNode;
  tooltip: string;
}

const ProgressBarWrapper = ({ children, votesPercentage, tooltip }: Props) => {
  const theme = useTheme();

  return (
    <Tippy
      disabled={false}
      content={tooltip}
      interactive={true}
      placement="bottom"
    >
      <Box display="flex" alignItems="center" flexDirection="column" w="100%">
        <Text
          m="0"
          color="tenantPrimary"
          fontSize="s"
          fontWeight="bold"
          w="100%"
        >
          {children}
        </Text>
        <Box
          w="100%"
          h="8px"
          borderRadius="2px"
          border={`1px solid ${theme.colors.tenantPrimary}`}
          bgColor={theme.colors.tenantPrimaryLighten75}
          position="relative"
        >
          <Box
            w={`${votesPercentage}%`}
            h="100%"
            bgColor={theme.colors.tenantPrimary}
            borderRadius="2px"
          />
        </Box>
      </Box>
    </Tippy>
  );
};

export default ProgressBarWrapper;

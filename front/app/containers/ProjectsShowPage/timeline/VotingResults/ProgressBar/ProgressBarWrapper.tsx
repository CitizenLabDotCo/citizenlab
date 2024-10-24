import React, { ReactNode } from 'react';

import { Box, Text, Tooltip } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

interface Props {
  votesPercentage: number;
  manualVotesPercentage?: number;
  children: ReactNode;
  tooltip: string;
}

const ProgressBarWrapper = ({
  children,
  votesPercentage,
  manualVotesPercentage,
  tooltip,
}: Props) => {
  const theme = useTheme();

  return (
    <Tooltip disabled={false} content={tooltip} placement="bottom">
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
          border={`1px solid ${theme.colors.tenantPrimary}`}
          bgColor={theme.colors.tenantPrimaryLighten75}
          position="relative"
          display="flex"
        >
          <Box
            w={`${votesPercentage}%`}
            h="100%"
            bgColor={theme.colors.tenantPrimary}
          />
          <Box
            w={`${manualVotesPercentage}%`}
            h="100%"
            style={{
              backgroundImage: `repeating-linear-gradient(
            135deg,
            ${theme.colors.tenantPrimary},
            ${theme.colors.tenantPrimary} 4px,
            ${theme.colors.tenantPrimaryLighten75} 4px,
            ${theme.colors.tenantPrimaryLighten75} 8px
          )`,
            }}
          />
        </Box>
      </Box>
    </Tooltip>
  );
};

export default ProgressBarWrapper;

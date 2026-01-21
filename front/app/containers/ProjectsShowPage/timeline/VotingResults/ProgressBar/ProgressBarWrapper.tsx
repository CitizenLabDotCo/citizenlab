import React, { ReactNode } from 'react';

import { Box, Text, Tooltip } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

interface Props {
  votesPercentage: number;
  manualVotesPercentage?: number;
  children?: ReactNode;
  tooltip?: string;
  barColor?: string;
  bgColor?: string;
  height?: string;
}

const ProgressBarWrapper = ({
  children,
  votesPercentage,
  manualVotesPercentage,
  tooltip,
  barColor,
  bgColor,
  height = '8px',
}: Props) => {
  const theme = useTheme();

  const primaryColor = barColor || theme.colors.tenantPrimary;
  const backgroundColor = bgColor || theme.colors.tenantPrimaryLighten75;

  const barContent = (
    <Box display="flex" alignItems="center" flexDirection="column" w="100%">
      {children && (
        <Text
          m="0"
          fontSize="s"
          fontWeight="bold"
          w="100%"
          style={{ color: primaryColor }}
        >
          {children}
        </Text>
      )}
      <Box
        w="100%"
        h={height}
        border={`1px solid ${primaryColor}`}
        bgColor={backgroundColor}
        borderRadius="4px"
        overflow="hidden"
        position="relative"
        display="flex"
      >
        <Box w={`${votesPercentage}%`} h="100%" bgColor={primaryColor} />
        {manualVotesPercentage !== undefined && manualVotesPercentage > 0 && (
          <Box
            w={`${manualVotesPercentage}%`}
            h="100%"
            style={{
              backgroundImage: `repeating-linear-gradient(
                135deg,
                ${primaryColor},
                ${primaryColor} 4px,
                ${backgroundColor} 4px,
                ${backgroundColor} 8px
              )`,
            }}
          />
        )}
      </Box>
    </Box>
  );

  if (tooltip) {
    return (
      <Tooltip disabled={false} content={tooltip} placement="bottom">
        {barContent}
      </Tooltip>
    );
  }

  return barContent;
};

export default ProgressBarWrapper;

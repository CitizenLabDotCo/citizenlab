import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

interface DistributionBarProps {
  name: string;
  count: number;
  maxCount: number;
  barColor: string;
  /** Color for the badge/count text. Defaults to barColor if not provided */
  badgeColor?: string;
  /** If provided, shows percentage alongside count */
  percentage?: number;
  /** If true, shows count in a colored badge. If false, shows count as colored text */
  showBadge?: boolean;
}

const DistributionBar = ({
  name,
  count,
  maxCount,
  barColor,
  badgeColor,
  percentage,
  showBadge = true,
}: DistributionBarProps) => {
  const barWidthPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
  const countColor = badgeColor || barColor;

  return (
    <Box mb="12px">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb="6px"
      >
        <Text
          m="0"
          fontSize="s"
          color="textPrimary"
          style={{ textTransform: 'capitalize' }}
        >
          {name}
        </Text>
        <Box display="flex" alignItems="center" gap="8px">
          {percentage !== undefined && (
            <Text m="0" fontSize="s" color="textSecondary">
              {percentage}%
            </Text>
          )}
          {showBadge ? (
            <Box py="2px" px="8px" borderRadius="4px" bgColor={countColor}>
              <Text m="0" fontSize="xs" fontWeight="bold" color="white">
                {count}
              </Text>
            </Box>
          ) : (
            <Text
              m="0"
              fontSize="s"
              fontWeight="semi-bold"
              style={{ color: countColor }}
            >
              {count}
            </Text>
          )}
        </Box>
      </Box>
      <Box
        bgColor={colors.grey100}
        borderRadius="9999px"
        h="8px"
        overflow="hidden"
      >
        <Box
          h="100%"
          borderRadius="9999px"
          width={`${barWidthPercent}%`}
          minWidth={barWidthPercent > 0 ? '8px' : '0'}
          style={{ backgroundColor: barColor }}
        />
      </Box>
    </Box>
  );
};

export default DistributionBar;

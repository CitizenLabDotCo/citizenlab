import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

export interface HorizontalBarRowData {
  id: string;
  title: string;
  count: number;
  color: string;
  percentage?: string;
}

interface Props {
  data: HorizontalBarRowData;
  maxCount: number;
  showPercentage?: boolean;
}

const HorizontalBarRow = ({
  data,
  maxCount,
  showPercentage = false,
}: Props) => {
  const barWidthPercent = maxCount > 0 ? (data.count / maxCount) * 100 : 0;

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb="8px"
      >
        <Text m="0" fontSize="s" color="textPrimary">
          {data.title}
        </Text>
        <Text m="0" fontSize="s" fontWeight="semi-bold">
          <Text as="span" style={{ color: data.color }}>
            {data.count}
          </Text>
          {showPercentage && data.percentage && (
            <Text as="span" color="textSecondary" fontWeight="normal">
              {' '}
              ({data.percentage} %)
            </Text>
          )}
        </Text>
      </Box>
      <Box
        bgColor={colors.grey100}
        borderRadius="9999px"
        h="12px"
        overflow="hidden"
      >
        <Box
          h="100%"
          borderRadius="9999px"
          width={`${barWidthPercent}%`}
          minWidth={barWidthPercent > 0 ? '12px' : '0'}
          style={{
            backgroundColor: data.color,
          }}
        />
      </Box>
    </Box>
  );
};

export default HorizontalBarRow;

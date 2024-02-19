import React from 'react';

// components
import { Box, Text, colors } from '@citizenlab/cl2-component-library';

// utils
import { roundPercentages, sum } from 'utils/math';

interface Props {
  values: number[];
  total: number;
  colorScheme: string[];
  leftLabel?: string;
  rightLabel?: string;
}

const getRoundedPercentages = (values: number[], total: number) => {
  const valuesSum = sum(values);
  const remainder = total - valuesSum;

  if (remainder < 0) {
    throw new Error('Total is smaller than the sum of the values');
  }

  const valuesWithRemainder = [...values, remainder];
  const roundedPercentages = roundPercentages(valuesWithRemainder, 1);

  return roundedPercentages.slice(0, values.length);
};

const ProgressBars2 = ({
  values,
  total,
  leftLabel,
  rightLabel,
  colorScheme,
}: Props) => {
  const percentages = getRoundedPercentages(values, total);
  const showLabels = !!leftLabel || !!rightLabel;
  const border = `1px solid ${colors.divider}`;

  return (
    <Box width="100%">
      {showLabels && (
        <Box
          width="100%"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          my="12px"
        >
          {leftLabel && (
            <Text variant="bodyM" m="0">
              {leftLabel}
            </Text>
          )}
          {rightLabel && (
            <Text variant="bodyS" color="textSecondary" m="0">
              {rightLabel}
            </Text>
          )}
        </Box>
      )}
      {percentages.map((percentage, index) => {
        const last = index === percentages.length - 1;

        return (
          <Box
            key={index}
            height="16px"
            width="100%"
            borderRadius="3px"
            border={border}
            borderBottom={last ? border : 'none'}
            overflow="hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={`${percentage}%`}
              height="25px"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <rect
                width="100"
                height="100"
                fill={colorScheme[index % colorScheme.length]}
              />
            </svg>
          </Box>
        );
      })}
    </Box>
  );
};

export default ProgressBars2;

import React from 'react';

// components
import { Box, Text, colors } from '@citizenlab/cl2-component-library';

// i18n
import T from 'components/T';

// typings
import { Multiloc } from 'typings';

interface Props {
  percentages: number[];
  leftLabel?: Multiloc;
  rightLabel?: string;
}

const COLOR_SCHEME = [colors.primary, colors.orange, colors.brown];

const StackedBar = ({ percentages, leftLabel, rightLabel }: Props) => {
  const stackedPercentages = percentages.reduce(
    (acc, percentage, index) => [
      ...acc,
      index > 0 ? acc[acc.length - 1] + percentage : 0,
    ],
    []
  );

  return (
    <Box width="100%">
      {(leftLabel || rightLabel) && (
        <Box
          width="100%"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          my="12px"
        >
          {leftLabel && (
            <Text variant="bodyM" m="0">
              <T value={leftLabel} />
            </Text>
          )}
          {rightLabel && (
            <Text variant="bodyS" color="textSecondary" m="0">
              {rightLabel}
            </Text>
          )}
        </Box>
      )}
      <Box
        height="16px"
        width="100%"
        borderRadius="3px"
        border={`1px solid ${colors.divider};`}
        overflow="hidden"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="25px"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {percentages.map((width, index) => (
            <rect
              key={index}
              x={`${stackedPercentages[index]}%`}
              width={width}
              height="100"
              fill={COLOR_SCHEME[index % COLOR_SCHEME.length]}
            />
          ))}
        </svg>
      </Box>
    </Box>
  );
};

export default StackedBar;

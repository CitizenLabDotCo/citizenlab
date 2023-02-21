import React from 'react';

// components
import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';
import T from 'components/T';

type CompletionBarProps = {
  bgColor: string;
  completed: number;
  leftLabel?: Multiloc;
  rightLabel?: string;
};

const CompletionBar = ({
  bgColor,
  completed,
  leftLabel,
  rightLabel,
}: CompletionBarProps) => (
  <Box width="100%">
    {(leftLabel || rightLabel) && (
      <Box width="100%" display="flex" justifyContent="space-between">
        {leftLabel && (
          <Text variant="bodyM">
            <T value={leftLabel} />
          </Text>
        )}
        {rightLabel && (
          <Text variant="bodyS" color="textSecondary">
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
        width={`${completed}%`}
        height="25px"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <rect width="100" height="100" fill={bgColor} />
      </svg>
    </Box>
  </Box>
);

export default CompletionBar;

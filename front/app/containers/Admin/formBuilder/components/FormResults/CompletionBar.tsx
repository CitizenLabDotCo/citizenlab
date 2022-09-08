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
          <Text variant="bodyS" color="adminSecondaryTextColor">
            {rightLabel}
          </Text>
        )}
      </Box>
    )}
    <Box
      height="15px"
      width="100%"
      borderRadius="3px"
      border={`1px solid ${colors.separation};`}
    >
      <Box height="100%" width={`${completed}%`} bgColor={bgColor} />
    </Box>
  </Box>
);

export default CompletionBar;

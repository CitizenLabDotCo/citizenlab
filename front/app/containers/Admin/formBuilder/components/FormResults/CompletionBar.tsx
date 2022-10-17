import React from 'react';

// components
import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';
import T from 'components/T';

// styles
import styled from 'styled-components';

type CompletionBarProps = {
  bgColor: string;
  completed: number;
  leftLabel?: Multiloc;
  rightLabel?: string;
};

const CompletionBox = styled.div`
  overflow: hidden;
  border-radius: 3px;
  height: 16px;
  width: 100%;
  border: 1px solid ${colors.divider};
`;

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
    <CompletionBox>
      <Box height="100%" width={`${completed}%`} bgColor={bgColor} />
    </CompletionBox>
  </Box>
);

export default CompletionBar;

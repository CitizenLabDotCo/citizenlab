import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import { GrowingBar } from '../animations';

import { Span, TimelineScale, position } from './timelineScale';

type Props = {
  scale: TimelineScale;
  span: Span;
  color: string;
};

const TimelineBar = ({ scale, span, color }: Props) => {
  const { left, width } = position(scale, span);

  return (
    <Box
      flex="1"
      position="relative"
      height="24px"
      borderRadius="999px"
      bgColor={colors.grey100}
      aria-hidden
    >
      <GrowingBar
        position="absolute"
        top="0"
        bottom="0"
        left={`${left}%`}
        width={`${Math.max(width, 4)}%`}
        borderRadius="999px"
        bgColor={color}
      />
    </Box>
  );
};

export default TimelineBar;

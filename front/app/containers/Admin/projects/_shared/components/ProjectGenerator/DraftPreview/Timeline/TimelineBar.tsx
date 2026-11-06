import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import { GrowingBar } from '../../animations';

import { Span, TimelineScale, position } from './timelineScale';

type BarTone = 'saved' | 'pending' | 'removed';

const TONE_COLORS: Record<BarTone, string> = {
  saved: colors.coolGrey300,
  pending: colors.teal400,
  removed: colors.red400,
};

type Props = {
  scale: TimelineScale;
  span: Span;
  tone: BarTone;
  point?: boolean;
};

const TimelineBar = ({ scale, span, tone, point = false }: Props) => {
  const { left, width } = position(scale, span);

  return (
    <Box
      position="relative"
      width="100%"
      height="6px"
      borderRadius="999px"
      bgColor={colors.grey100}
      aria-hidden
    >
      {point ? (
        <Box
          position="absolute"
          top="-2px"
          left={`${left}%`}
          ml="-5px"
          width="10px"
          height="10px"
          borderRadius="50%"
          bgColor={TONE_COLORS[tone]}
          border={`2px solid ${colors.white}`}
        />
      ) : (
        <GrowingBar
          position="absolute"
          top="0"
          bottom="0"
          left={`${left}%`}
          width={`${Math.max(width, 2)}%`}
          borderRadius="999px"
          bgColor={TONE_COLORS[tone]}
        />
      )}
    </Box>
  );
};

export default TimelineBar;

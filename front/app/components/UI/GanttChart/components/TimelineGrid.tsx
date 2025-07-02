import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

interface TimelineGridProps {
  cellCount: number;
  unitW: number;
  showTodayLine?: boolean;
  todayOffset?: number;
}

const TimelineGrid: React.FC<TimelineGridProps> = ({
  cellCount,
  unitW,
  showTodayLine,
  todayOffset,
}) => (
  <>
    <Box position="absolute" width="100%" height="100%">
      {Array.from({ length: cellCount }).map((_, i) => (
        <Box
          key={`grid-line-${i}`}
          position="absolute"
          left={`${i * unitW - 0.5}px`}
          width="1px"
          height="100%"
          bg={colors.divider}
        />
      ))}
    </Box>
    {showTodayLine && todayOffset !== undefined && (
      <Box
        position="absolute"
        width="2px"
        height="100%"
        bg={colors.primary}
        style={{
          left: `${todayOffset * unitW + unitW / 2 - 1}px`,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <Box
          position="absolute"
          top="-5px"
          left="-4px"
          width="10px"
          height="10px"
          borderRadius="50%"
          bg={colors.primary}
        />
      </Box>
    )}
  </>
);

export default TimelineGrid;

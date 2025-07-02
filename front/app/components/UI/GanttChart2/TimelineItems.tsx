import React, { ReactNode } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import GanttItemComponent from './GanttItem';
import { rowHeight, timelineHeaderHeight } from './utils';

import type { GanttItem } from './types';

interface TimelineItemsProps {
  items: GanttItem[];
  startDate: Date;
  endDate: Date;
  getOffset: (date: Date) => number;
  getDuration: (start: Date, end: Date) => number;
  unitW: number;
  renderItemTooltip?: (item: GanttItem) => ReactNode;
}

const TimelineItems: React.FC<TimelineItemsProps> = ({
  items,
  startDate,
  endDate,
  getOffset,
  getDuration,
  unitW,
  renderItemTooltip,
}) => (
  <Box
    position="absolute"
    top={`${timelineHeaderHeight}px`}
    left="0"
    height={`${items.length * rowHeight}px`}
    width="100%"
    zIndex="1"
  >
    {items.map((item, index) => (
      <GanttItemComponent
        key={item.id}
        item={item}
        index={index}
        startDate={startDate}
        endDate={endDate}
        getOffset={getOffset}
        getDuration={getDuration}
        unitW={unitW}
        renderItemTooltip={renderItemTooltip}
      />
    ))}
  </Box>
);

export default TimelineItems;

import React, { ReactNode } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { rowHeight } from '../utils';

import GanttItem from './GanttItem';

import type { GanttItem as GanttItemType } from '../types';

interface TimelineItemsProps {
  items: GanttItemType[];
  startDate: Date;
  endDate: Date;
  getOffset: (date: Date) => number;
  getDuration: (start: Date, end: Date) => number;
  unitW: number;
  renderItemTooltip?: (item: GanttItemType) => ReactNode;
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
  <Box position="relative" height={`${items.length * rowHeight}px`}>
    {items.map((item, index) => (
      <GanttItem
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

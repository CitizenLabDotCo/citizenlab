import React, { ReactNode } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { rowHeight, timelineHeaderHeight } from '../utils';

import GanttItemComponent from './GanttItem';

import type { GanttItem, ViewBounds } from '../types';

interface TimelineItemsProps {
  items: GanttItem[];
  viewBounds: ViewBounds;
  getOffset: (date: Date) => number;
  getDuration: (start: Date, end: Date) => number;
  unitWidth: number;
  renderItemTooltip?: (item: GanttItem) => ReactNode;
}

const TimelineItems = ({
  items,
  viewBounds,
  getOffset,
  getDuration,
  unitWidth,
  renderItemTooltip,
}: TimelineItemsProps) => (
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
        viewBounds={viewBounds}
        getOffset={getOffset}
        getDuration={getDuration}
        unitWidth={unitWidth}
        renderItemTooltip={renderItemTooltip}
      />
    ))}
  </Box>
);

export default TimelineItems;

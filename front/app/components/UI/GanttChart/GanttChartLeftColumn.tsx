import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import GanttItemIconBar from './GanttItemIconBar';
import { GanttItem } from './types';

interface GanttChartLeftColumnProps {
  items: GanttItem[];
  rowHeight: number;
  onItemLabelClick?: (item: GanttItem) => void;
  leftColumnWidth: number;
}

const GanttChartLeftColumn: React.FC<GanttChartLeftColumnProps> = ({
  items,
  rowHeight,
  onItemLabelClick,
  leftColumnWidth,
}) => {
  return (
    <Box
      width={`${leftColumnWidth}px`}
      position="sticky"
      borderRight={`1px solid ${colors.grey300}`}
      bg={colors.white}
      style={{ left: 0, zIndex: 2 }}
    >
      {items.map((item) => (
        <Box
          key={item.id}
          height={`${rowHeight}px`}
          display="flex"
          alignItems="center"
          pl="16px"
          pr="8px"
          borderBottom={`1px solid ${colors.grey300}`}
          style={{
            cursor: onItemLabelClick ? 'pointer' : 'default',
          }}
          onClick={onItemLabelClick ? () => onItemLabelClick(item) : undefined}
        >
          <GanttItemIconBar
            color={item.color}
            icon={item.icon}
            rowHeight={rowHeight}
            mr="8px"
          />
          <Text
            whiteSpace="nowrap"
            textOverflow="ellipsis"
            variant="bodyS"
            overflow="hidden"
          >
            {item.title}
          </Text>
        </Box>
      ))}
    </Box>
  );
};

export default GanttChartLeftColumn;

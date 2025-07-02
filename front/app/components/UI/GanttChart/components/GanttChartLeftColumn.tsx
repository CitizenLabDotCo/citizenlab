import React from 'react';

import { Box, Text, colors, Button } from '@citizenlab/cl2-component-library';

import { GanttItem } from '../types';

import GanttItemIconBar from './GanttItemIconBar';

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
    >
      {items.map((item, index) => (
        <Box
          key={item.id}
          borderBottom={`1px solid ${colors.grey300}`}
          borderTop={index === 0 ? `1px solid ${colors.grey300}` : 'none'}
          height={`${rowHeight}px`}
          display="flex"
        >
          <Button
            buttonStyle="text"
            justify="left"
            onClick={
              onItemLabelClick ? () => onItemLabelClick(item) : undefined
            }
          >
            <Box
              display="flex"
              justifyContent="flex-start"
              alignItems="center"
              height="100%"
              w="100%"
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
          </Button>
        </Box>
      ))}
    </Box>
  );
};

export default GanttChartLeftColumn;

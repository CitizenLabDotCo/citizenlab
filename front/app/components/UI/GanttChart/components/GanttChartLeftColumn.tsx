import React from 'react';

import { Box, Text, colors, Button } from '@citizenlab/cl2-component-library';

import { GanttItem } from '../types';
import { rowHeight, leftColumnWidth } from '../utils';

import GanttItemIconBar from './GanttItemIconBar';

interface GanttChartLeftColumnProps {
  items: GanttItem[];
  onItemLabelClick?: (item: GanttItem) => void;
}

const GanttChartLeftColumn = ({
  items,
  onItemLabelClick,
}: GanttChartLeftColumnProps) => {
  return (
    <Box
      width={`${leftColumnWidth}px`}
      minWidth={`${leftColumnWidth}px`}
      position="sticky"
      left="0"
      zIndex="3"
      borderRight={`1px solid ${colors.grey300}`}
      bg={colors.white}
    >
      {items.map((item, index) => (
        <Box
          key={item.id}
          borderBottom={`1px solid ${colors.grey300}`}
          borderTop={index === 0 ? `1px solid ${colors.grey300}` : undefined}
          height={`${rowHeight}px`}
          display="flex"
          bg={colors.white}
        >
          <Button
            buttonStyle="text"
            textDecorationHover="underline"
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
              maxWidth={`${leftColumnWidth - 32}px`}
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

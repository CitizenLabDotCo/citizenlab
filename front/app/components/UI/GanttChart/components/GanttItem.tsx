import React from 'react';

import { Box, Tooltip, Text, colors } from '@citizenlab/cl2-component-library';
import { max, min } from 'date-fns';

import { rowHeight } from '../utils';

import GanttItemIconBar from './GanttItemIconBar';

import type { GanttItem } from '../types';

interface GanttItemProps {
  item: GanttItem;
  index: number;
  startDate: Date;
  endDate: Date;
  getOffset: (date: Date) => number;
  getDuration: (start: Date, end: Date) => number;
  unitW: number;
  renderItemTooltip?: (item: GanttItem) => React.ReactNode;
}

const GanttItemComponent: React.FC<GanttItemProps> = ({
  item,
  index,
  startDate,
  endDate,
  getOffset,
  getDuration,
  unitW,
  renderItemTooltip,
}) => {
  const start = item.start ? new Date(item.start) : undefined;
  if (!start) return null;
  const end = item.end ? new Date(item.end) : null;
  const effectiveStart = start > startDate ? start : startDate;
  const effectiveEnd = end === null || end > endDate ? endDate : end;
  if (effectiveStart >= effectiveEnd) return null;
  const startOffset = getOffset(effectiveStart);
  const duration = getDuration(effectiveStart, effectiveEnd);
  if (duration <= 0) return null;

  const textLabel = (
    <Box as="span" px="4px">
      <Text
        fontSize="s"
        color="grey800"
        overflow="hidden"
        whiteSpace="nowrap"
        my="0"
      >
        {item.title}
      </Text>
    </Box>
  );

  let textInHighlight = false;
  const highlightStart = item.highlightStartDate
    ? new Date(item.highlightStartDate)
    : null;
  if (highlightStart) {
    textInHighlight = highlightStart.getTime() === effectiveStart.getTime();
  }

  return (
    <Box
      key={item.id}
      position="absolute"
      top={`${index * rowHeight + 4}px`}
      left={`${startOffset * unitW}px`}
      width={`${duration * unitW}px`}
      height={`${rowHeight - 8}px`}
    >
      <Tooltip
        placement="bottom"
        content={renderItemTooltip ? renderItemTooltip(item) : ''}
        disabled={!renderItemTooltip}
        theme="dark"
        followCursor="initial"
      >
        <Box
          width="100%"
          height="100%"
          background={colors.white}
          border="1px solid"
          borderColor={colors.grey300}
          borderRadius="4px"
          display="flex"
          alignItems="center"
        >
          <Box display="flex" alignItems="center">
            <GanttItemIconBar
              color={item.color}
              icon={item.icon}
              rowHeight={rowHeight}
              mr="0px"
              ml="4px"
            />
            {!textInHighlight && textLabel}
          </Box>
          {highlightStart && (
            <Box
              position="absolute"
              left={`${
                (getOffset(max([start!, highlightStart])) - startOffset) * unitW
              }px`}
              width={`${
                getDuration(
                  max([start!, highlightStart]),
                  min([
                    end || endDate,
                    item.highlightEndDate
                      ? new Date(item.highlightEndDate)
                      : endDate,
                  ])
                ) * unitW
              }px`}
              height="100%"
              bg={colors.teal50}
              border={`1px solid ${colors.teal400}`}
              display="flex"
              alignItems="center"
              overflow="hidden"
            >
              {textInHighlight && (
                <Box display="flex" alignItems="center" as="span" px="4px">
                  <GanttItemIconBar
                    color={item.color}
                    icon={item.icon}
                    rowHeight={rowHeight}
                    mr="8px"
                    ml="0px"
                  />
                  <Text
                    fontSize="s"
                    color="grey800"
                    overflow="hidden"
                    whiteSpace="nowrap"
                    my="0"
                  >
                    {item.title}
                  </Text>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Tooltip>
    </Box>
  );
};

export default GanttItemComponent;

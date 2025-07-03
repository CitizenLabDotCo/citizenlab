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

  const highlightStart = item.highlightStartDate
    ? new Date(item.highlightStartDate)
    : null;
  const highlightEnd = item.highlightEndDate
    ? new Date(item.highlightEndDate)
    : null;

  let textInHighlight = false;
  if (highlightStart) {
    const startTs = effectiveStart.getTime();
    const highlightStartTs = highlightStart.getTime();
    const highlightEndTs = highlightEnd ? highlightEnd.getTime() : Infinity;
    textInHighlight = startTs >= highlightStartTs && startTs < highlightEndTs;
  }

  const TextLabel = () => (
    <Box
      display="flex"
      alignItems="center"
      as="span"
      px="4px"
      overflow="hidden"
    >
      <GanttItemIconBar
        color={item.color}
        icon={item.icon}
        rowHeight={rowHeight}
        mr="8px"
      />
      <Text
        fontSize="s"
        color="grey800"
        overflow="hidden"
        whiteSpace="nowrap"
        textOverflow="ellipsis"
      >
        {item.title}
      </Text>
    </Box>
  );

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
        >
          {/* Highlight overlay - rendered at the base level */}
          {highlightStart && (
            <Box
              position="absolute"
              left={`${
                (getOffset(max([effectiveStart, highlightStart])) -
                  startOffset) *
                unitW
              }px`}
              width={`${
                getDuration(
                  max([effectiveStart, highlightStart]),
                  min([effectiveEnd, highlightEnd || endDate])
                ) * unitW
              }px`}
              height="100%"
              bg={colors.teal50}
              border={`1px solid ${colors.teal400}`}
              overflow="hidden"
            >
              {textInHighlight && <TextLabel />}
            </Box>
          )}

          {!textInHighlight && (
            <Box
              position="relative"
              zIndex="1"
              height="100%"
              display="flex"
              alignItems="center"
            >
              <TextLabel />
            </Box>
          )}
        </Box>
      </Tooltip>
    </Box>
  );
};

export default GanttItemComponent;

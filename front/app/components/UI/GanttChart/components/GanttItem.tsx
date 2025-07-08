import React from 'react';

import { Box, Tooltip, colors } from '@citizenlab/cl2-component-library';
import { max, min } from 'date-fns';

import { rowHeight } from '../utils';

import GanttItemTextLabel from './GanttItemTextLabel';

import type { GanttItem, ViewBounds } from '../types';

interface GanttItemProps {
  item: GanttItem;
  index: number;
  viewBounds: ViewBounds;
  getOffset: (date: Date) => number;
  getDuration: (start: Date, end: Date) => number;
  unitW: number;
  renderItemTooltip?: (item: GanttItem) => React.ReactNode;
}

const GanttItem = ({
  item,
  index,
  viewBounds,
  getOffset,
  getDuration,
  unitW,
  renderItemTooltip,
}: GanttItemProps) => {
  const start = item.start ? new Date(item.start) : undefined;
  if (!start) return null;
  const end = item.end ? new Date(item.end) : null;

  const effectiveStart = start > viewBounds.left ? start : viewBounds.left;
  const effectiveEnd =
    end === null || end > viewBounds.right ? viewBounds.right : end;
  if (effectiveStart >= effectiveEnd) return null;

  const startOffset = getOffset(effectiveStart);
  const duration = getDuration(effectiveStart, effectiveEnd);
  if (duration <= 0) return null;

  const highlightStart = item.highlight?.start
    ? new Date(item.highlight.start)
    : null;
  const highlightEnd = item.highlight?.end
    ? new Date(item.highlight.end)
    : null;

  let textInHighlight = false;
  if (highlightStart) {
    const startTs = effectiveStart.getTime();
    const highlightStartTs = highlightStart.getTime();
    const highlightEndTs = highlightEnd ? highlightEnd.getTime() : Infinity;
    textInHighlight = startTs >= highlightStartTs && startTs < highlightEndTs;
  }

  return (
    <Tooltip
      placement="bottom"
      content={renderItemTooltip ? renderItemTooltip(item) : ''}
      disabled={!renderItemTooltip}
      theme="dark"
      followCursor="initial"
    >
      <Box
        position="absolute"
        top={`${index * rowHeight + 4}px`}
        left={`${startOffset * unitW}px`}
        width={`${duration * unitW}px`}
        height={`${rowHeight - 8}px`}
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
                  min([effectiveEnd, highlightEnd || viewBounds.right])
                ) * unitW
              }px`}
              height="100%"
              bg={colors.teal50}
              border={`1px solid ${colors.teal400}`}
              display="flex"
              overflow="hidden"
              alignItems="center"
            >
              {textInHighlight && (
                <GanttItemTextLabel
                  title={item.title}
                  id={item.id}
                  color={item.color}
                  icon={item.icon}
                />
              )}
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
              <GanttItemTextLabel
                title={item.title}
                id={item.id}
                color={item.color}
                icon={item.icon}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Tooltip>
  );
};

export default GanttItem;

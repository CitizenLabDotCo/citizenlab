import React from 'react';

import { Box, Tooltip, colors } from '@citizenlab/cl2-component-library';
import { max, min } from 'date-fns';

import { parseBackendDateString } from 'utils/dateUtils';

import { rowHeight } from '../utils';

import GanttItemTextLabel from './GanttItemTextLabel';

import type { GanttItem, ViewBounds } from '../types';

interface GanttItemProps {
  item: GanttItem;
  index: number;
  viewBounds: ViewBounds;
  getOffset: (date: Date) => number;
  getDuration: (start: Date, end: Date) => number;
  unitWidth: number;
  renderItemTooltip?: (item: GanttItem) => React.ReactNode;
}

const GanttItem = ({
  item,
  index,
  viewBounds,
  getOffset,
  getDuration,
  unitWidth,
  renderItemTooltip,
}: GanttItemProps) => {
  const start = item.start ? parseBackendDateString(item.start) : undefined;
  if (!start) return null;
  const end = item.end ? parseBackendDateString(item.end) : null;

  const effectiveStart = start > viewBounds.left ? start : viewBounds.left;
  const effectiveEnd = !end || end > viewBounds.right ? viewBounds.right : end;
  if (effectiveStart >= effectiveEnd) return null;

  const startOffset = getOffset(effectiveStart);
  const duration = getDuration(effectiveStart, effectiveEnd);
  if (duration <= 0) return null;

  // The highlight logic renders a colored overlay to emphasize a specific date range
  // (e.g., a "current phase") within the main Gantt item bar.
  const highlightStart = item.highlight?.start
    ? parseBackendDateString(item.highlight.start)
    : null;
  const highlightEnd = item.highlight?.end
    ? parseBackendDateString(item.highlight.end)
    : null;

  let textInHighlight = false;
  if (highlightStart) {
    const startTs = effectiveStart.getTime();
    const highlightStartTs = highlightStart.getTime();
    const highlightEndTs = highlightEnd ? highlightEnd.getTime() : Infinity;
    textInHighlight = startTs >= highlightStartTs && startTs < highlightEndTs;
  }

  // Determines the visible starting date of the highlight. It's the later of
  // two dates: the start of the highlight period or the start of the visible Gantt bar.
  const highlightVisibleStart = highlightStart
    ? max([effectiveStart, highlightStart])
    : null;

  // Determines the visible ending date of the highlight. It's the earlier of
  // the highlight's end date or the end of the visible Gantt bar.
  const highlightVisibleEnd = highlightEnd
    ? min([effectiveEnd, highlightEnd])
    : min([effectiveEnd, viewBounds.right]);

  // Calculates the highlight's starting position in pixels, relative to the
  // left edge of the parent Gantt bar.
  const highlightStartPx = highlightVisibleStart
    ? (getOffset(highlightVisibleStart) - startOffset) * unitWidth
    : 0;

  // Calculates the highlight's total width in pixels based on its
  // visible start and end dates.
  const highlightWidthPx = highlightVisibleStart
    ? getDuration(highlightVisibleStart, highlightVisibleEnd) * unitWidth
    : 0;

  return (
    <Tooltip
      placement="bottom"
      content={renderItemTooltip ? renderItemTooltip(item) : ''}
      disabled={!renderItemTooltip}
      theme="dark"
      followCursor="initial"
      zIndex={9999}
      appendTo={typeof window !== 'undefined' ? () => document.body : undefined}
    >
      <Box
        position="absolute"
        top={`${index * rowHeight + 4}px`}
        left={`${startOffset * unitWidth}px`}
        width={`${duration * unitWidth}px`}
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
              left={`${highlightStartPx}px`}
              width={`${highlightWidthPx}px`}
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

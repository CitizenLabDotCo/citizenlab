import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import { TimeGroup, timelineHeaderHeight } from '../utils';

/**
 * Renders a single major group in the timeline header (e.g., "February").
 * It includes the top label, the horizontal grouping line, and the sub-cells.
 */
const TimeGroupColumn = ({
  group,
  totalHeight,
}: {
  group: TimeGroup;
  totalHeight: number;
}) => (
  <Box
    minWidth={`${group.totalWidth}px`}
    height={`${totalHeight}px`}
    borderRight={`2px solid ${colors.divider}`} // Strong border between major groups
    position="relative"
  >
    {/* Top Row Header Area */}
    <Box
      position="absolute"
      top="0"
      left="0"
      width="100%"
      height={`${timelineHeaderHeight / 2}px`}
      display="flex"
      alignItems="center"
      justifyContent="center"
      px="4px"
      borderBottom={`1px solid ${colors.divider}`}
    >
      <Text fontSize="s" fontWeight="semi-bold">
        {group.label}
      </Text>
    </Box>

    {/* Bottom Row Header Area */}
    <Box
      position="absolute"
      top={`${timelineHeaderHeight / 2}px`}
      left="0"
      width="100%"
      height={`${timelineHeaderHeight / 2}px`}
      display="flex"
    >
      {group.subCells.map((cell, index) => (
        <Box
          key={cell.key}
          minWidth={`${cell.width}px`}
          width={`${cell.width}px`}
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          // Thin border for every sub-cell except the last one in the group
          borderRight={
            index < group.subCells.length - 1
              ? `1px solid ${colors.divider}`
              : 'none'
          }
        >
          <Text fontSize="xs" color="grey600">
            {cell.label}
          </Text>
        </Box>
      ))}
    </Box>

    {/* Full height grid lines for the body */}
    <Box
      position="absolute"
      top={`${timelineHeaderHeight}px`}
      left="0"
      width="100%"
      height={`calc(100% - ${timelineHeaderHeight}px)`}
      display="flex"
    >
      {group.subCells.map((cell, index) => (
        <Box
          key={cell.key}
          minWidth={`${cell.width}px`}
          width={`${cell.width}px`}
          height="100%"
          borderRight={
            index < group.subCells.length - 1
              ? `1px solid ${colors.divider}`
              : 'none'
          }
        />
      ))}
    </Box>
  </Box>
);

/**
 * Renders the entire timeline header and grid background using a grouped data structure.
 */
const GroupedTimeline = ({
  groups,
  totalBodyHeight,
}: {
  groups: TimeGroup[];
  totalBodyHeight: number;
}) => (
  <Box
    display="flex"
    position="absolute"
    top="0"
    left="0"
    width="100%"
    height={`${totalBodyHeight}px`}
    zIndex="0"
  >
    {groups.map((group) => (
      <TimeGroupColumn
        key={group.key}
        group={group}
        totalHeight={totalBodyHeight}
      />
    ))}
  </Box>
);

export default GroupedTimeline;

import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { rowHeight } from '../utils';

import GanttItemIconBar from './GanttItemIconBar';

import type { GanttItem } from '../types';

type GanttItemTextLabelProps = Pick<
  GanttItem,
  'id' | 'title' | 'color' | 'icon'
>;

const GanttItemTextLabel = ({
  title,
  color,
  icon,
}: GanttItemTextLabelProps) => (
  <Box display="flex" alignItems="center" as="span" px="4px" overflow="hidden">
    <GanttItemIconBar
      color={color}
      icon={icon}
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
      {title}
    </Text>
  </Box>
);

export default GanttItemTextLabel;

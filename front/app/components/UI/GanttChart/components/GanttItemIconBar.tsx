import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import Icon, { IconNames } from 'component-library/components/Icon';

interface GanttItemIconBarProps {
  color?: string;
  icon?: IconNames;
  rowHeight: number;
  ml?: string;
  mr?: string;
}

const GanttItemIconBar = ({
  color,
  icon,
  rowHeight,
  ml = '4px',
  mr = '4px',
}: GanttItemIconBarProps) => (
  <Box display="flex" alignItems="center" ml={ml} mr={mr}>
    <Box
      width="4px"
      height={`${rowHeight - 16}px`}
      borderRadius="2px"
      bg={color}
      mr={icon ? '4px' : '0'}
    />
    {icon && <Icon name={icon} width="16" height="16" ariaHidden />}
  </Box>
);

export default GanttItemIconBar;

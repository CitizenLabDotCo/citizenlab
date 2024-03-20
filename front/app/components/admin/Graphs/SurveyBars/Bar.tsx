import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import { BarProps } from './typings';
import { getBorderRadius } from './utils';

const BORDER = `1px solid ${colors.divider}`;

const Bar = ({ type = 'single', percentage, color }: BarProps) => {
  return (
    <Box
      height="16px"
      width="100%"
      borderRadius={getBorderRadius(type)}
      border={BORDER}
      borderBottom={['last', 'single'].includes(type) ? BORDER : 'none'}
      overflow="hidden"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={`${percentage}%`}
        height="25px"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="e2e-progress-bar"
      >
        <rect width="100" height="100" fill={color} />
      </svg>
    </Box>
  );
};

export default Bar;

import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import { Bar as BarProps } from './typings';
import { getBorderRadius } from './utils';

const BORDER = `1px solid ${colors.divider}`;

const Bar = ({ type, count, percentage, color }: BarProps) => {
  return (
    <Box
      height="20px"
      width="100%"
      borderRadius={getBorderRadius(type)}
      border={BORDER}
      borderBottom={['last', 'single'].includes(type) ? BORDER : 'none'}
      overflow="hidden"
      display="flex"
      flexDirection="row"
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
      {type !== 'single' && (
        <Text m="0" fontSize="xs" ml="8px">
          {`${percentage}% (${count})`}
        </Text>
      )}
    </Box>
  );
};

export default Bar;

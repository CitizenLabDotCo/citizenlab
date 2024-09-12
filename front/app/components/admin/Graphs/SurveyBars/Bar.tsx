import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import { Bar as BarProps } from './typings';
import { getBorderRadius } from './utils';

const BORDER = `1px solid ${colors.divider}`;

type Props = BarProps & {
  showLabel?: boolean;
};

const Bar = ({ type, count, percentage, color, showLabel = false }: Props) => {
  return (
    <Box
      height="16px"
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
      {showLabel && (
        <Text m="0" fontSize="xs" mt="-2px" ml="8px">
          {`${percentage}% (${count})`}
        </Text>
      )}
    </Box>
  );
};

export default Bar;

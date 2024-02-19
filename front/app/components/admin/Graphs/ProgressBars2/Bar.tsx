import React from 'react';
import { Box, colors } from '@citizenlab/cl2-component-library';

const BORDER = `1px solid ${colors.divider}`;

type Type = 'first' | 'middle' | 'last' | 'single';

interface Props {
  type?: Type;
  percentage: number;
  color?: string;
}

const getBorderRadius = (type: Type) => {
  switch (type) {
    case 'first':
      return '3px 3px 0 0';
    case 'middle':
      return '0';
    case 'last':
      return '0 0 3px 3px';
    case 'single':
      return '3px';
  }
};

const Bar = ({ type = 'single', percentage, color }: Props) => {
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
      >
        <rect width="100" height="100" fill={color} />
      </svg>
    </Box>
  );
};

export default Bar;

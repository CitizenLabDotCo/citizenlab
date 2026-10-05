import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { INDICATOR_THICKNESS } from './getIndicatorRect';

const CAP_SIZE = 10;

const ACROSS = `${(INDICATOR_THICKNESS - CAP_SIZE) / 2}px`;
const ALONG = `-${CAP_SIZE / 2}px`;

type Props = {
  color: string;
  vertical: boolean;
  atEnd: boolean;
};

const DropIndicatorCap = ({ color, vertical, atEnd }: Props) => {
  const topOffset = vertical ? (atEnd ? undefined : ALONG) : ACROSS;
  const bottomOffset = vertical && atEnd ? ALONG : undefined;
  const leftOffset = vertical ? ACROSS : atEnd ? undefined : ALONG;
  const rightOffset = !vertical && atEnd ? ALONG : undefined;

  return (
    <Box
      position="absolute"
      top={topOffset}
      bottom={bottomOffset}
      left={leftOffset}
      right={rightOffset}
      width={`${CAP_SIZE}px`}
      height={`${CAP_SIZE}px`}
      borderRadius="50%"
      bgColor={color}
    />
  );
};

export default DropIndicatorCap;

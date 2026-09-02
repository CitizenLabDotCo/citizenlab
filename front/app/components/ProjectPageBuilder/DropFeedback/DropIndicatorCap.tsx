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

const DropIndicatorCap = ({ color, vertical, atEnd }: Props) => (
  <Box
    position="absolute"
    top={vertical ? (atEnd ? undefined : ALONG) : ACROSS}
    bottom={vertical && atEnd ? ALONG : undefined}
    left={vertical ? ACROSS : atEnd ? undefined : ALONG}
    right={!vertical && atEnd ? ALONG : undefined}
    width={`${CAP_SIZE}px`}
    height={`${CAP_SIZE}px`}
    borderRadius="50%"
    bgColor={color}
  />
);

export default DropIndicatorCap;

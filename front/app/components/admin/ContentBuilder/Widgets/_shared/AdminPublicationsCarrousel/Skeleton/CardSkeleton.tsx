import React from 'react';

import { Box, useBreakpoint, Shimmer } from '@citizenlab/cl2-component-library';

import ImageSkeleton from '../../ImageSkeleton';
import { BIG_CARD_WIDTH, SMALL_CARD_WIDTH } from '../constants';

interface Props {
  ml?: string;
  mr?: string;
}

const CardSkeleton = ({ ml, mr }: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');
  const cardWidth = isSmallerThanPhone ? SMALL_CARD_WIDTH : BIG_CARD_WIDTH;

  return (
    <Box w={`${cardWidth}px`} ml={ml} mr={mr}>
      <ImageSkeleton />
      <Shimmer
        width={`${cardWidth * 0.8}px`}
        borderRadius="16px"
        height="20px"
        mt="8px"
      />
      <Shimmer width="80px" borderRadius="16px" height="16px" mt="12px" />
      <Shimmer
        width={`${cardWidth}px`}
        borderRadius="16px"
        height="16px"
        mt="12px"
      />
      <Shimmer width="90px" borderRadius="16px" height="16px" mt="12px" />
    </Box>
  );
};

export default CardSkeleton;

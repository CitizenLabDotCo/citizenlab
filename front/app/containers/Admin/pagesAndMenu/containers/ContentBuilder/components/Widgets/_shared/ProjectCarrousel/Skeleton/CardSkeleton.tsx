import React from 'react';

import { Shimmer, Box } from '@citizenlab/cl2-component-library';

import ImageSkeleton from '../../ImageSkeleton';
import { CARD_WIDTH } from '../constants';

interface Props {
  ml?: string;
  mr?: string;
}

const CardSkeleton = ({ ml, mr }: Props) => {
  return (
    <Box w={`${CARD_WIDTH}px`} ml={ml} mr={mr}>
      <ImageSkeleton />
      <Shimmer
        width={`${CARD_WIDTH}px`}
        borderRadius="16px"
        height="20px"
        mt="8px"
      />
      <Shimmer width="140px" borderRadius="16px" height="20px" mt="8px" />
      <Shimmer width="100px" borderRadius="16px" height="16px" mt="12px" />
      <Shimmer width="120px" borderRadius="16px" height="16px" mt="10px" />
    </Box>
  );
};

export default CardSkeleton;

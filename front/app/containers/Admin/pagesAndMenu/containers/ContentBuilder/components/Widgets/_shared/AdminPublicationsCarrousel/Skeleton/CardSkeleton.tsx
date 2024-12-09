import React from 'react';

import { Box, useBreakpoint, Shimmer } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import ImageSkeleton from '../../ImageSkeleton';
import { BIG_CARD_WIDTH, SMALL_CARD_WIDTH } from '../constants';

interface Props {
  ml?: string;
  mr?: string;
}

const CardSkeleton = ({ ml, mr }: Props) => {
  const theme = useTheme();

  const isSmallerThanPhone = useBreakpoint('phone');

  const cardWidth = isSmallerThanPhone ? SMALL_CARD_WIDTH : BIG_CARD_WIDTH;

  return (
    <Box w={`${cardWidth}px`} ml={ml} mr={mr}>
      <ImageSkeleton />
      <Shimmer
        bgColor={theme.colors.tenantText}
        width={`${cardWidth}px`}
        borderRadius="16px"
        height="20px"
        mt="8px"
      />
      <Shimmer
        bgColor={theme.colors.tenantText}
        width="140px"
        borderRadius="16px"
        height="20px"
        mt="8px"
      />
    </Box>
  );
};

export default CardSkeleton;

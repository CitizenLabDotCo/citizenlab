import React from 'react';

import { colors, Shimmer, Box } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import ImageSkeleton from '../../ImageSkeleton';
import { CARD_WIDTH } from '../constants';

interface Props {
  ml?: string;
  mr?: string;
}

const CardSkeleton = ({ ml, mr }: Props) => {
  const theme = useTheme();

  return (
    <Box w={`${CARD_WIDTH}px`} ml={ml} mr={mr}>
      <ImageSkeleton />
      <Shimmer
        bgColor={theme.colors.tenantText}
        width={`${CARD_WIDTH}px`}
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
      <Shimmer
        bgColor={theme.colors.tenantText}
        width="100px"
        borderRadius="16px"
        height="16px"
        mt="12px"
      />
      <Shimmer
        bgColor={colors.grey600}
        width="120px"
        borderRadius="16px"
        height="16px"
        mt="10px"
      />
    </Box>
  );
};

export default CardSkeleton;

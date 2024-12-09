import React from 'react';

import { useBreakpoint, Box } from '@citizenlab/cl2-component-library';
import { lighten } from 'polished';
import styled, { useTheme } from 'styled-components';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

import { CARD_GAP } from '../../BaseCarrousel/constants';
import { CarrouselContainer } from '../../BaseCarrousel/Containers';

import CardSkeleton from './CardSkeleton';

const ShimmerBox = styled(Box)<{ $bgColor: string }>`
  ${({ $bgColor }) => {
    return `background: linear-gradient(
      -45deg, 
      ${$bgColor} 40%, 
      ${lighten(0.4)($bgColor)} 50%,
      ${$bgColor} 60%
    );`;
  }}
  background-size: 300%;
  background-position-x: 100%;
  animation: shimmer 2s infinite;

  @keyframes shimmer {
    to {
      background-position-x: 0%;
    }
  }
`;

const Skeleton = () => {
  const isSmallerThanPhone = useBreakpoint('phone');
  const theme = useTheme();

  return (
    <CarrouselContainer>
      <ShimmerBox
        $bgColor={theme.colors.tenantText}
        width="240px"
        borderRadius="16px"
        height="32px"
        mb="16px"
        ml={isSmallerThanPhone ? DEFAULT_PADDING : undefined}
      />

      <Box display="flex" flexDirection="row">
        <CardSkeleton
          ml={isSmallerThanPhone ? `${CARD_GAP}px` : undefined}
          mr={isSmallerThanPhone ? undefined : `${CARD_GAP}px`}
        />
        <CardSkeleton
          ml={isSmallerThanPhone ? `${CARD_GAP}px` : undefined}
          mr={isSmallerThanPhone ? undefined : `${CARD_GAP}px`}
        />
      </Box>
    </CarrouselContainer>
  );
};

export default Skeleton;

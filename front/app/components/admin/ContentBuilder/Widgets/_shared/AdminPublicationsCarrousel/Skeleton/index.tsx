import React from 'react';

import { useBreakpoint, Box } from '@citizenlab/cl2-component-library';

import { CARD_GAP } from '../../BaseCarrousel/constants';
import { CarrouselContainer } from '../../BaseCarrousel/Containers';
import CarrouselTitle from '../../CarrouselTitle';

import CardSkeleton from './CardSkeleton';

interface Props {
  title: string;
}

const Skeleton = ({ title }: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');

  return (
    <CarrouselContainer>
      <CarrouselTitle>{title}</CarrouselTitle>

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

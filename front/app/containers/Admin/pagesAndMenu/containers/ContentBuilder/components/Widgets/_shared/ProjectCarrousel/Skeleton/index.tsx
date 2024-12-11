import React from 'react';

import { useBreakpoint, Box, Title } from '@citizenlab/cl2-component-library';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

import { CARD_GAP } from '../../BaseCarrousel/constants';
import { CarrouselContainer } from '../../BaseCarrousel/Containers';

import CardSkeleton from './CardSkeleton';

interface Props {
  title: string;
}

const Skeleton = ({ title }: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');

  return (
    <CarrouselContainer>
      <Title
        variant="h2"
        mt="0px"
        ml={isSmallerThanPhone ? DEFAULT_PADDING : undefined}
        color="tenantText"
      >
        {title}
      </Title>

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

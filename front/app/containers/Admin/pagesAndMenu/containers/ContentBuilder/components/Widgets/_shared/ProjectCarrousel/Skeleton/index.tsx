import React from 'react';

import { useBreakpoint, Box } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

import { CARD_GAP } from '../../BaseCarrousel/constants';
import { CarrouselContainer } from '../../BaseCarrousel/Containers';

import CardSkeleton from './CardSkeleton';

const Skeleton = () => {
  const isSmallerThanPhone = useBreakpoint('phone');
  const theme = useTheme();

  return (
    <CarrouselContainer>
      {/* <Title
        variant="h2"
        mt="0px"
        ml={isSmallerThanPhone ? DEFAULT_PADDING : undefined}
        color="tenantText"
      >
        Test title
      </Title> */}
      <Box
        bgColor={theme.colors.tenantText}
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

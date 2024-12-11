import React from 'react';

import { Box, Title, useBreakpoint } from '@citizenlab/cl2-component-library';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

import { CarrouselContainer } from '../_shared/BaseCarrousel/Containers';

interface Props {
  title: string;
}

const AreaSelection = ({ title }: Props) => {
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
      <Box>TODO areas</Box>
    </CarrouselContainer>
  );
};

export default AreaSelection;

import React from 'react';

import { Box, useBreakpoint, media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

import { DEFAULT_Y_PADDING } from '../../constants';

const StyledBox = styled(Box)`
  .scroll-button {
    opacity: 0;
    transition: opacity 0.3s;
    cursor: pointer;
  }

  &:hover {
    .scroll-button {
      opacity: 1;
    }
  }
`;

interface CarrouselContainerProps {
  className?: string;
  children: React.ReactNode;
}

export const CarrouselContainer = ({
  className,
  children,
}: CarrouselContainerProps) => {
  const isSmallerThanPhone = useBreakpoint('phone');

  return (
    <Box
      px={isSmallerThanPhone ? undefined : DEFAULT_PADDING}
      py={DEFAULT_Y_PADDING}
      w="100%"
      display="flex"
      overflowX="hidden"
      justifyContent="center"
      className={className}
    >
      <StyledBox w="100%" maxWidth="1200px" position="relative">
        {children}
      </StyledBox>
    </Box>
  );
};

export const CardContainer = styled.div`
  ${media.phone`
    scroll-snap-align: start;  
  `}
`;

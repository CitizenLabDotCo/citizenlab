import React, { useContext } from 'react';

import { Box, useBreakpoint, media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import {
  BAND_Y_PADDING,
  BUILDER_CONTENT_MAX_WIDTH,
  DEFAULT_Y_PADDING,
} from 'components/admin/ContentBuilder/constants';
import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';
import { VerticalRhythmContext } from 'components/admin/ContentBuilder/verticalRhythm';

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
  dataCy?: string;
}

export const CarrouselContainer = ({
  className,
  children,
  dataCy,
}: CarrouselContainerProps) => {
  const isSmallerThanPhone = useBreakpoint('phone');
  const craftComponentDefaultPadding = useCraftComponentDefaultPadding();
  // Under the spacing rhythm a band pads itself on the same scale as the other bands.
  // The homepage is outside that system and keeps its own spacing.
  const underRhythm = useContext(VerticalRhythmContext);

  return (
    <Box
      px={isSmallerThanPhone ? undefined : craftComponentDefaultPadding}
      py={underRhythm ? BAND_Y_PADDING : DEFAULT_Y_PADDING}
      w="100%"
      display="flex"
      overflowX="hidden"
      justifyContent="center"
      className={className}
      data-cy={dataCy}
    >
      <StyledBox
        w="100%"
        maxWidth={BUILDER_CONTENT_MAX_WIDTH}
        position="relative"
      >
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

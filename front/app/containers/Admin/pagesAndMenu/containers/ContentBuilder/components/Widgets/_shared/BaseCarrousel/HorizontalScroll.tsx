import React, { ReactNode } from 'react';

import { Box, isRtl } from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

const StyledContainer = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: nowrap;
  overflow: auto;
  overflow-x: scroll;
  height: auto;
  width: 100%;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  ::-webkit-scrollbar {
    display: none;
  }
  scroll-behavior: smooth;
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
  scroll-snap-type: x mandatory;
`;

interface Props {
  children: ReactNode;
  setRef: (instance: HTMLDivElement | null) => void;
}

const HorizontalScroll = ({ children, setRef }: Props) => {
  const theme = useTheme();

  return (
    <Box display="flex" flexDirection={theme.isRtl ? 'row-reverse' : 'row'}>
      <StyledContainer ref={setRef}>{children}</StyledContainer>
    </Box>
  );
};

export default HorizontalScroll;

import React, { useEffect, ReactNode } from 'react';

import { Box, isRtl } from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';
import styled, { useTheme } from 'styled-components';

const StyledContainer = styled(Box)`
  display: flex;
  gap: 16px;
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
}

const HorizontalScroll = ({ children }: Props) => {
  const theme = useTheme();
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const handleScroll = debounce(() => {
      // TODO
    }, 100);

    const container = containerRef.current;
    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <Box display="flex" flexDirection={theme.isRtl ? 'row-reverse' : 'row'}>
      <StyledContainer ref={containerRef}>{children}</StyledContainer>
    </Box>
  );
};

export default HorizontalScroll;

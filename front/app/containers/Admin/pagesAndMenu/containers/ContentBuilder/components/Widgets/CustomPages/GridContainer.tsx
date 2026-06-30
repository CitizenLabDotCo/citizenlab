import React from 'react';

import { Box, useBreakpoint, media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';

import { DEFAULT_Y_PADDING } from '../constants';

export const Grid = styled.div`
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(3, 1fr);

  ${media.tablet`
    grid-template-columns: repeat(2, 1fr);
  `}

  ${media.phone`
    grid-template-columns: repeat(1, 1fr);
  `}
`;

interface Props {
  children: React.ReactNode;
}

const GridContainer = ({ children }: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');
  const craftComponentDefaultPadding = useCraftComponentDefaultPadding();

  return (
    <Box
      px={isSmallerThanPhone ? undefined : craftComponentDefaultPadding}
      py={DEFAULT_Y_PADDING}
      w="100%"
      display="flex"
      justifyContent="center"
    >
      <Box w="100%" maxWidth="1200px">
        {children}
      </Box>
    </Box>
  );
};

export default GridContainer;

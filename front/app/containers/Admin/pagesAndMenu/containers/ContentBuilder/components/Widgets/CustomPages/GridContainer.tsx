import React from 'react';

import { Box, media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useCraftComponentDefaultPadding from 'components/admin/ContentBuilder/useCraftComponentDefaultPadding';

import { DEFAULT_Y_PADDING } from '../constants';

// minmax(0, ...) rather than a plain 1fr: the implicit minimum of a 1fr track is
// the min-content of the card, which makes the grid overflow its container as
// soon as a page title contains a word wider than the available column.
export const Grid = styled.div`
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  ${media.tablet`
    grid-template-columns: repeat(2, minmax(0, 1fr));
  `}

  ${media.phone`
    grid-template-columns: repeat(1, minmax(0, 1fr));
  `}
`;

interface Props {
  children: React.ReactNode;
}

const GridContainer = ({ children }: Props) => {
  const craftComponentDefaultPadding = useCraftComponentDefaultPadding();

  return (
    <Box
      className="e2e-custom-pages-widget"
      px={craftComponentDefaultPadding}
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

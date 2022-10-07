import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// styling
import { SEMANTIC_UI_HEADER_BG_COLOR } from './constants';

interface Props {
  children: React.ReactNode;
  background?: string;
}

const Header = ({
  children,
  background = SEMANTIC_UI_HEADER_BG_COLOR,
}: Props) => (
  <Box as="thead" background={background}>
    {children}
  </Box>
);

export default Header;

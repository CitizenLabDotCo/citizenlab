import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

// styling
import { SEMANTIC_UI_HEADER_BG_COLOR } from './constants';

interface Props {
  children: React.ReactNode;
}

const Header = ({ children }: Props) => (
  <Box as="thead" background={SEMANTIC_UI_HEADER_BG_COLOR}>
    {children}
  </Box>
);

export default Header;

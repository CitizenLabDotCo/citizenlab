import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

interface Props {
  children: React.ReactNode;
}

const SEMANTIC_UI_HEADER_BG_COLOR = '#f9fafb';

const Header = ({ children }: Props) => (
  <Box as="thead" background={SEMANTIC_UI_HEADER_BG_COLOR}>
    {children}
  </Box>
);

export default Header;

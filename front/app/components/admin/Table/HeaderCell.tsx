import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

interface Props {
  children: React.ReactNode;
}

const HeaderCell = ({ children }: Props) => <Box as="th">{children}</Box>;

export default HeaderCell;

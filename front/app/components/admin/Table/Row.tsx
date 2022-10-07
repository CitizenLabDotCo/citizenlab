import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

interface Props {
  children: React.ReactNode;
}

const Row = ({ children }: Props) => <Box as="tr">{children}</Box>;

export default Row;

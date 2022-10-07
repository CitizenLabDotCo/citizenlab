import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

interface Props {
  children: React.ReactNode;
}

const Body = ({ children }: Props) => <Box as="tbody">{children}</Box>;

export default Body;

import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';

interface Props {
  children: React.ReactNode;
}

const Footer = ({ children }: Props) => <Box as="tfoot">{children}</Box>;

export default Footer;

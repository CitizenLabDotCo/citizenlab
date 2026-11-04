import React from 'react';

import Box from 'component-library/components/Box';

const Hero = ({ children }: { children?: React.ReactNode }) => (
  <Box p="4px">{children}</Box>
);

export default Hero;

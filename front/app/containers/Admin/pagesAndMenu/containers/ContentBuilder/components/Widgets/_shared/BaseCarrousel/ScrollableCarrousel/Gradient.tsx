import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

interface Props {
  variant: 'left' | 'right';
}

const Gradient = ({ variant }: Props) => (
  <Box
    top="32px"
    left={variant === 'left' ? '0' : undefined}
    right={variant === 'right' ? '0' : undefined}
    w="30px"
    h="calc(100% - 32px)"
    position="absolute"
    zIndex="2"
    background={`linear-gradient(to ${
      variant === 'left' ? 'right' : 'left'
    }, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%)`}
  />
);

export default Gradient;

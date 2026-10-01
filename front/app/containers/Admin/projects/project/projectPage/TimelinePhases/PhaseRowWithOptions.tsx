import React, { ReactNode } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

const Container = styled(Box)`
  .phase-options {
    opacity: 0;
    transition: opacity 80ms ease-out;
  }

  &:hover .phase-options,
  &:focus-within .phase-options,
  .phase-options:has([aria-expanded='true']) {
    opacity: 1;
  }
`;

interface Props {
  options: ReactNode;
  children: ReactNode;
}

const PhaseRowWithOptions = ({ options, children }: Props) => (
  <Container position="relative">
    {children}
    <Box className="phase-options" position="absolute" top="6px" right="6px">
      {options}
    </Box>
  </Container>
);

export default PhaseRowWithOptions;

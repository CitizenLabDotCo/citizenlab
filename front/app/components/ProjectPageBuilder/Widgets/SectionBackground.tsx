import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

type Props = {
  fullBleed?: boolean;
  pt?: string;
  pb?: string;
  py?: string;
  children: React.ReactNode;
};

const SectionBackground = ({ fullBleed, pt, pb, py, children }: Props) => (
  <Box
    background={colors.background}
    mx={fullBleed ? 'calc(-50vw + 50%)' : undefined}
    pt={pt}
    pb={pb}
    py={py}
  >
    {children}
  </Box>
);

export default SectionBackground;

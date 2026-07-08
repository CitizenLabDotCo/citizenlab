import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

type Props = {
  // On the public page the widgets render inside a width-constrained frame;
  // fullBleed breaks the grey band out to the full viewport width. The builder
  // canvas isn't viewport-wide, so there the band stays at container width.
  fullBleed?: boolean;
  pt?: string;
  pb?: string;
  py?: string;
  children: React.ReactNode;
};

// Grey band behind the timeline + participation content, mirroring the legacy
// project page's grey section.
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

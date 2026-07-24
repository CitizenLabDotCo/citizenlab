import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import useIsPageBodyChild from './useIsPageBodyChild';

// Widgets expose this as their `sectionBackground` prop, set from the widget's
// settings panel.
export type SectionBackgroundChoice = 'colored' | 'white';

// A colored band reads as a page section at the top level but as an arbitrary
// grey box inside a column, so widgets without an explicit choice default by
// placement.
export const useDefaultSectionBackground = (): SectionBackgroundChoice =>
  useIsPageBodyChild() ? 'colored' : 'white';

type Props = {
  colored: boolean;
  fullBleed?: boolean;
  pt?: string;
  pb?: string;
  py?: string;
  children: React.ReactNode;
};

const SectionBackground = ({
  colored,
  fullBleed,
  pt,
  pb,
  py,
  children,
}: Props) => (
  <Box
    background={colored ? colors.background : undefined}
    mx={fullBleed ? 'calc(-50vw + 50%)' : undefined}
    pt={pt}
    pb={pb}
    py={py}
  >
    {children}
  </Box>
);

export default SectionBackground;

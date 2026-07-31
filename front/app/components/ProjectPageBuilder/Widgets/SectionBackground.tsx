import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import useIsPageBodyChild from './useIsPageBodyChild';

export type SectionBackgroundChoice = 'colored' | 'white';

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

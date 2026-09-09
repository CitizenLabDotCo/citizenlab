import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

// The padding is what gives a section its band of background. When the content
// inside renders nothing, that padding would be all that is left, so collapse
// it rather than leave an empty band behind.
const Section = styled(Box)`
  &:empty {
    display: none;
  }
`;

type Props = {
  fullBleed?: boolean;
  pt?: string;
  pb?: string;
  py?: string;
  children: React.ReactNode;
};

const SectionBackground = ({ fullBleed, pt, pb, py, children }: Props) => (
  <Section
    mx={fullBleed ? 'calc(-50vw + 50%)' : undefined}
    pt={pt}
    pb={pb}
    py={py}
  >
    {children}
  </Section>
);

export default SectionBackground;

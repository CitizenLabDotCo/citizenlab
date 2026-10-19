import React, { ReactNode, RefObject } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

interface Props {
  anchor: DOMRect | null;
  layer: RefObject<HTMLDivElement>;
  children: ReactNode;
}

// The fixed layer a menu floats in, the size and place of its button; the
// menu opens from it as it would from the button.
const AnchoredLayer = ({ anchor, layer, children }: Props) => {
  if (!anchor) return null;

  return (
    <Box
      ref={layer}
      position="fixed"
      top={`${anchor.top}px`}
      left={`${anchor.left}px`}
      width={`${anchor.width}px`}
      height={`${anchor.height}px`}
      zIndex="10"
    >
      {children}
    </Box>
  );
};

export default AnchoredLayer;

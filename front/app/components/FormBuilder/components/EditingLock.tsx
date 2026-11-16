import React, { ReactNode } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

type Props = {
  locked: boolean;
  children: ReactNode;
};

// Keeps part of the builder out of reach while it's locked, also from the keyboard.
const EditingLock = ({ locked, children }: Props) => (
  <Box
    opacity={locked ? 0.5 : 1}
    pointerEvents={locked ? 'none' : 'auto'}
    // React 18 has no `inert` prop, so the attribute is set on the element directly.
    ref={(element: HTMLElement | null) => {
      if (!element) return;
      if (locked) {
        element.setAttribute('inert', '');
      } else {
        element.removeAttribute('inert');
      }
    }}
  >
    {children}
  </Box>
);

export default EditingLock;

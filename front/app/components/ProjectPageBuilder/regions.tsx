import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { UserComponent } from '@craftjs/core';

type RegionProps = {
  children?: React.ReactNode;
};

// The project page layout is split into two canvas regions so the locked header
// (Project image + Title) can't be reordered and nothing can be dropped above
// it:
//
//   ROOT (ProjectPageRoot, canMoveIn: false)  ← rejects all drops
//     ├─ Project image   (locked)
//     ├─ Title           (locked)
//     └─ ProjectPageBody (the only droppable region) ← user widgets go here
//
// Because the root rejects drops, the only valid drop target is the body, which
// sits below the locked header — so widgets can never land above it.

export const ProjectPageRoot: UserComponent<RegionProps> = ({ children }) => (
  <Box id="e2e-content-builder-frame" w="100%">
    {children}
  </Box>
);

ProjectPageRoot.craft = {
  rules: {
    canMoveIn: () => false,
    canMoveOut: () => false,
  },
  custom: {
    region: true,
  },
};

export const ProjectPageBody: UserComponent<RegionProps> = ({ children }) => (
  <Box id="e2e-project-page-body" w="100%" minHeight="60px">
    {children}
  </Box>
);

ProjectPageBody.craft = {
  custom: {
    region: true,
  },
};

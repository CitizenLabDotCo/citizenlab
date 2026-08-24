import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { UserComponent, useEditor } from '@craftjs/core';

type RegionProps = {
  children?: React.ReactNode;
};

export const CustomPageRoot: UserComponent<RegionProps> = ({ children }) => (
  <Box id="e2e-content-builder-frame" w="100%">
    {children}
  </Box>
);

CustomPageRoot.craft = {
  rules: {
    canMoveIn: () => false,
    canMoveOut: () => false,
  },
  custom: {
    region: true,
  },
};

export const CustomPageBody: UserComponent<RegionProps> = ({ children }) => {
  const { enabled: inEditor } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return (
    <Box
      id="e2e-custom-page-body"
      w="100%"
      minHeight={inEditor ? '60px' : undefined}
    >
      {children}
    </Box>
  );
};

CustomPageBody.craft = {
  custom: {
    region: true,
  },
};

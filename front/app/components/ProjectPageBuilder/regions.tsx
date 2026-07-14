import React, { useRef } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Node, UserComponent, useEditor } from '@craftjs/core';

import CTABar from './CTABar';
import useWidgetProjectId from './Widgets/useWidgetProjectId';

type RegionProps = {
  children?: React.ReactNode;
};

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

export const ProjectPageBody: UserComponent<RegionProps> = ({ children }) => {
  const projectId = useWidgetProjectId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { enabled: inEditor } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return (
    <Box
      id="e2e-project-page-body"
      w="100%"
      minHeight={inEditor ? '60px' : undefined}
      ref={containerRef}
    >
      {children}
      {!inEditor && projectId && (
        <CTABar projectId={projectId} containerRef={containerRef} />
      )}
    </Box>
  );
};

const HEADER_WIDGETS = ['ProjectBanner', 'ProjectTitle'];

ProjectPageBody.craft = {
  rules: {
    canMoveIn: (incoming: Node[]) =>
      incoming.every((node) => !HEADER_WIDGETS.includes(node.data.name)),
  },
  custom: {
    region: true,
  },
};

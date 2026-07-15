import React, { useRef } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { Node, UserComponent, useEditor } from '@craftjs/core';
import styled, { css } from 'styled-components';

import { useParams } from 'utils/router';

import CTABar from './CTABar';
import useWidgetProjectId from './Widgets/useWidgetProjectId';

type RegionProps = {
  children?: React.ReactNode;
};

// The body paints a neutral white so the page look doesn't depend on the
// legacy page container's background; sections tint themselves through their
// background setting. On the public page the white spans the full viewport
// width via a backdrop, so the body itself keeps constraining its children.
const BodyBackground = styled(Box)<{ $fullBleed: boolean }>`
  background: ${colors.white};
  ${({ $fullBleed }) =>
    $fullBleed &&
    css`
      background: none;
      position: relative;
      &::before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: calc(-50vw + 50%);
        width: 100vw;
        background: ${colors.white};
        z-index: -1;
      }
    `}
`;

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
  const { slug } = useParams({ strict: false }) as { slug?: string };
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { enabled: inEditor } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  return (
    <BodyBackground
      id="e2e-project-page-body"
      w="100%"
      minHeight={inEditor ? '60px' : undefined}
      ref={containerRef}
      $fullBleed={!!slug}
    >
      {children}
      {!inEditor && projectId && (
        <CTABar projectId={projectId} containerRef={containerRef} />
      )}
    </BodyBackground>
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

import React, { useRef } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { Node, UserComponent, useEditor } from '@craftjs/core';
import styled, { css } from 'styled-components';

import { useParams } from 'utils/router';

import CTABar from './CTABar';
import EditableContentDivider from './EditableContentDivider';
import LockedZonePill from './LockedZonePill';
import useWidgetProjectId from './Widgets/useWidgetProjectId';

type RegionProps = {
  children?: React.ReactNode;
};

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

// Room at the top of the locked zone, so the pill never sits on the banner.
const LOCKED_ZONE_PILL_STRIP = '34px';

export const ProjectPageRoot: UserComponent<RegionProps> = ({ children }) => {
  const { enabled: inEditor } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  // The zone's background only shows behind the banner and the title:
  // ProjectPageBody paints white over everything below it, and
  // normalizeProjectPageLayout keeps ROOT's children as [banner, title, body].
  return (
    <Box
      id="e2e-content-builder-frame"
      w="100%"
      position="relative"
      background={inEditor ? colors.grey200 : undefined}
      pt={inEditor ? LOCKED_ZONE_PILL_STRIP : undefined}
    >
      {inEditor && (
        <Box position="absolute" top="6px" right="8px" zIndex="1">
          <LockedZonePill />
        </Box>
      )}
      {children}
    </Box>
  );
};

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
      {inEditor && <EditableContentDivider />}
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

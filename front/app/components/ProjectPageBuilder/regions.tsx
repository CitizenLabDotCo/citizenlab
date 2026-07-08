import React from 'react';

import { Box, media } from '@citizenlab/cl2-component-library';
import { UserComponent } from '@craftjs/core';
import styled from 'styled-components';

import ProjectCTABar from 'containers/ProjectsShowPage/ProjectCTABar';

import { useParams } from 'utils/router';

import useWidgetProjectId from './Widgets/useWidgetProjectId';

type RegionProps = {
  children?: React.ReactNode;
};

// The two canvas regions of the frozen page structure (see defaultLayout.ts).
// The root rejects all drops, so nothing can ever land above or between the
// locked header widgets; the body is the only droppable region.

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

// `position: sticky` can only travel within its parent's box, so the CTA bar
// must be a direct child of the body (spanning the whole page), not of the
// short description section it visually follows. Flex `order` moves the
// description above it, restoring the bar's legacy flow position; the negative
// margins bleed the bar out of the width-constrained frame to the viewport.
const BodyWithStickyCTABar = styled(Box)`
  display: flex;
  flex-direction: column;

  & > :first-child {
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);
  }

  & > :nth-child(2) {
    order: -1;
    /* The legacy page's breathing room above the bar, which the flushed header
       and description section no longer provide. */
    margin-bottom: 89px;
    ${media.phone`
      margin-bottom: 59px;
    `}
  }
`;

export const ProjectPageBody: UserComponent<RegionProps> = ({ children }) => {
  // CTA bar on the public route only: in the builder it would stick over the canvas.
  const { slug } = useParams({ strict: false }) as { slug?: string };
  const projectId = useWidgetProjectId();

  if (!slug || !projectId) {
    return (
      <Box id="e2e-project-page-body" w="100%" minHeight="60px">
        {children}
      </Box>
    );
  }

  return (
    <BodyWithStickyCTABar id="e2e-project-page-body" w="100%">
      <ProjectCTABar projectId={projectId} />
      {children}
    </BodyWithStickyCTABar>
  );
};

ProjectPageBody.craft = {
  rules: {
    canMoveIn: () => false,
  },
  custom: {
    region: true,
  },
};

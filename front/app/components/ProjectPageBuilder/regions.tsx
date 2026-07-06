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

// Hosts the sticky CTA bar on the public page. `position: sticky` can only
// travel within its parent's box, so the bar (the first child) must be a
// direct child of the body — the region spanning the rest of the page — not
// of the (short) description section it visually follows. Flex `order` moves
// the description section (the frozen first body child, see the note below)
// above it, giving the bar its legacy flow position: below the description,
// above the timeline. The negative margins bleed the bar out of the
// width-constrained frame to the full viewport, like SectionBackground.
const BodyWithStickyCTABar = styled(Box)`
  display: flex;
  flex-direction: column;

  & > :first-child {
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);
  }

  & > :nth-child(2) {
    order: -1;
    /* The legacy page's breathing room above the bar: the header container's
       bottom padding (65px, 35px on phone) plus the description's 24px bottom
       margin, which the flushed header and description section no longer
       provide. */
    margin-bottom: 89px;
    ${media.phone`
      margin-bottom: 59px;
    `}
  }
`;

export const ProjectPageBody: UserComponent<RegionProps> = ({ children }) => {
  // Public route only (it carries a slug): in the builder and previews the CTA
  // bar would stick over the canvas.
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

// The body's section order is frozen during the transition (see
// defaultLayout.ts); new widgets can only be dropped inside the description
// section, never between the fixed sections.
ProjectPageBody.craft = {
  rules: {
    canMoveIn: () => false,
  },
  custom: {
    region: true,
  },
};

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

const CTA_BAR_CLASS = 'projectPageCtaBar';

const BodyWithStickyCTABar = styled(Box)`
  display: flex;
  flex-direction: column;

  & > .${CTA_BAR_CLASS} {
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);
  }

  /* The description section, which directly follows the bar in the DOM. */
  & > .${CTA_BAR_CLASS} + * {
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
      <ProjectCTABar projectId={projectId} className={CTA_BAR_CLASS} />
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

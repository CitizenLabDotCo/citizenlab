import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import { SectionDescription, SectionTitle } from 'components/admin/Section';
import Highlighter from 'components/Highlighter';
import Outlet from 'components/Outlet';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

import ProjectDiscoverability from './ProjectDiscoverability';
import ProjectManagement from './ProjectManagement';
import ProjectVisibility from './ProjectVisibility';

export const projectVisibilityFragmentId = 'project-visibility';

const ProjectPermissions = () => {
  const { projectId } = useParams();
  if (!projectId) return null;

  return (
    <>
      <SectionTitle>
        <FormattedMessage {...messages.projectVisibilityTitle} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.projectVisibilitySubtitle} />
      </SectionDescription>
      <ProjectDiscoverability projectId={projectId} />
      <Highlighter fragmentId={projectVisibilityFragmentId}>
        <ProjectVisibility projectId={projectId} />
      </Highlighter>
      <Outlet
        id="app.containers.Admin.project.edit.permissions.moderatorRights"
        projectId={projectId}
      >
        {(outletComponents) =>
          outletComponents.length > 0 ? (
            <Box mb="48px">{outletComponents}</Box>
          ) : null
        }
      </Outlet>
      <ProjectManagement projectId={projectId} />
    </>
  );
};

export default ProjectPermissions;

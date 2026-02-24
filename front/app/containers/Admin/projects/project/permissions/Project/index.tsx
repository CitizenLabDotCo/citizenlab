import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { SectionDescription, SectionTitle } from 'components/admin/Section';
import Outlet from 'components/Outlet';

import { FormattedMessage } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import messages from '../messages';

import ProjectDiscoverability from './ProjectDiscoverability';
import ProjectManagement from './ProjectManagement';
import ProjectVisibility from './ProjectVisibility';

const ProjectPermissions = () => {
  const { projectId } = useParams({
    from: '/$locale/admin/projects/$projectId/general/access-rights',
  });
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
      <ProjectVisibility projectId={projectId} />
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

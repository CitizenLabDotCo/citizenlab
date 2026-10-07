import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import Outlet from 'components/Outlet';

import ProjectManagement from './ProjectManagement';

interface Props {
  projectId: string;
}

const ProjectManagementSection = ({ projectId }: Props) => (
  <>
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

export default ProjectManagementSection;

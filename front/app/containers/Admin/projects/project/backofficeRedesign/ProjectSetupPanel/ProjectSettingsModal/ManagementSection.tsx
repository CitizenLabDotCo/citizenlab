import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import ProjectManagement from 'containers/Admin/projects/project/permissions/Project/ProjectManagement';

import Outlet from 'components/Outlet';

interface Props {
  projectId: string;
}

const ManagementSection = ({ projectId }: Props) => (
  <Box>
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
  </Box>
);

export default ManagementSection;

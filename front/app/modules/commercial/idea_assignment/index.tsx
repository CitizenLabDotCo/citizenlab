import React from 'react';

import styled from 'styled-components';

import { ModuleConfiguration } from 'utils/moduleUtils';

const AssigneeFilter = React.lazy(
  () => import('./admin/components/AssigneeFilter')
);
const InputAssignment = React.lazy(() => import('./admin/containers/'));
const AssigneeRow = React.lazy(() => import('./admin/components/AssigneeRow'));

const StyledAssigneeFilter = styled(AssigneeFilter)`
  margin-right: 20px;
`;

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.admin.PostManager.topActionBar': (props) => (
      <StyledAssigneeFilter {...props} />
    ),
    'app.containers.Admin.project.edit.permissions.moderatorRights': (
      props
    ) => <InputAssignment {...props} />,
    'app.containers.Admin.projects.phase.moderation': ({
      projectId,
      assignee,
      onAssigneeChange,
    }) => (
      <AssigneeRow
        projectId={projectId}
        assignee={assignee}
        onAssigneeChange={onAssigneeChange}
      />
    ),
  },
};

export default configuration;

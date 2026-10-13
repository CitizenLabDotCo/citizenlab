import React from 'react';

import styled from 'styled-components';

import { ModuleConfiguration } from 'utils/moduleUtils';

const AssigneeFilter = React.lazy(
  () => import('./admin/components/AssigneeFilter')
);
const InputAssignment = React.lazy(() => import('./admin/containers/'));
const AssigneeSetting = React.lazy(
  () => import('./admin/containers/AssigneeSetting')
);

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
    'app.containers.Admin.projects.project.settings.management': ({
      projectId,
    }) => <AssigneeSetting projectId={projectId} />,
  },
};

export default configuration;

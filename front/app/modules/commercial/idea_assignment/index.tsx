import React from 'react';

import styled from 'styled-components';

import { ModuleConfiguration } from 'utils/moduleUtils';

const AssigneeFilter = React.lazy(
  () => import('./admin/components/AssigneeFilter')
);
const InputAssignment = React.lazy(() => import('./admin/containers/'));

const FeatureFlag = React.lazy(() => import('components/FeatureFlag'));

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
    ) => (
      <FeatureFlag name="idea_assignment">
        <InputAssignment {...props} />
      </FeatureFlag>
    ),
  },
};

export default configuration;

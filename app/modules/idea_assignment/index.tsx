import React from 'react';
import styled from 'styled-components';
import { ModuleConfiguration } from 'utils/moduleUtils';

import AssigneeFilter from './admin/components/AssigneeFilter';

const StyledAssigneeFilter = styled(AssigneeFilter)`
  margin-right: 20px;
`;

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.admin.PostManager.topActionBar': (props) => (
      <StyledAssigneeFilter {...props} />
    ),
  },
};

export default configuration;

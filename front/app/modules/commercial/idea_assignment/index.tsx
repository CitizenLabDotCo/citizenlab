import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { ModuleConfiguration } from 'utils/moduleUtils';
import useFeatureFlag from 'hooks/useFeatureFlag';

import AssigneeFilter from './admin/components/AssigneeFilter';
import IdeaHeaderCell from './admin/components/IdeaHeaderCell';
import IdeaRowCell from './admin/components/IdeaRowCell';
import Tab from './admin/components/Tab';
import InputAssignment from './admin/containers/';

import FeatureFlag from 'components/FeatureFlag';

const StyledAssigneeFilter = styled(AssigneeFilter)`
  margin-right: 20px;
`;

type RenderOnTabHideConditionProps = {
  children: ReactNode;
};

const RenderOnTabHideCondition = ({
  children,
}: RenderOnTabHideConditionProps) => {
  // Could be more than just a feature flag check,
  // hence we're not using the FeatureFlag component
  const isEnabled = useFeatureFlag({ name: 'idea_assignment' });
  if (isEnabled) {
    return <>{children}</>;
  }
  return null;
};

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.admin.PostManager.topActionBar': (props) => (
      <StyledAssigneeFilter {...props} />
    ),
    'app.components.admin.PostManager.components.PostTable.IdeaRow.cells':
      IdeaRowCell,
    'app.components.admin.PostManager.components.PostTable.IdeaHeaderRow.cells':
      IdeaHeaderCell,
    'app.containers.Admin.project.edit.permissions.moderatorRights': (
      props
    ) => (
      <FeatureFlag name="idea_assignment">
        <InputAssignment {...props} />
      </FeatureFlag>
    ),
    'app.containers.Admin.projects.edit': (props) => {
      return (
        <RenderOnTabHideCondition>
          <Tab {...props} />
        </RenderOnTabHideCondition>
      );
    },
  },
};

export default configuration;

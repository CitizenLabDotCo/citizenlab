import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { ModuleConfiguration } from 'utils/moduleUtils';
import useFeatureFlag from 'hooks/useFeatureFlag';

import AssigneeFilter from './admin/components/AssigneeFilter';
import IdeaHeaderCell from './admin/components/IdeaHeaderCell';
import IdeaRowCell from './admin/components/IdeaRowCell';
import Tab from './admin/components/Tab';
import InputAssignment from './admin/containers/';

const StyledAssigneeFilter = styled(AssigneeFilter)`
  margin-right: 20px;
`;

type RenderOnFeatureFlagProps = {
  children: ReactNode;
};

type RenderOnTabHideConditionProps = {
  children: ReactNode;
};

const RenderOnFeatureFlag = ({ children }: RenderOnFeatureFlagProps) => {
  const isEnabled = useFeatureFlag('idea_assignment');

  if (isEnabled) {
    return <>{children}</>;
  }

  return null;
};

const RenderOnTabHideCondition = ({
  children,
}: RenderOnTabHideConditionProps) => {
  // could be the same as, but might diverge from RenderOnFeatureFlag
  const isEnabled = useFeatureFlag('idea_assignment');
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
    'app.components.admin.PostManager.components.PostTable.IdeaRow.cells': IdeaRowCell,
    'app.components.admin.PostManager.components.PostTable.IdeaHeaderRow.cells': IdeaHeaderCell,
    'app.containers.Admin.project.edit.permissions.moderatorRights': (
      props
    ) => (
      <RenderOnFeatureFlag>
        <InputAssignment {...props} />
      </RenderOnFeatureFlag>
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

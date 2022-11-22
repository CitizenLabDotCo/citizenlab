import useFeatureFlag from 'hooks/useFeatureFlag';
import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { ModuleConfiguration } from 'utils/moduleUtils';

const AssigneeFilter = React.lazy(
  () => import('./admin/components/AssigneeFilter')
);
const IdeaHeaderCell = React.lazy(
  () => import('./admin/components/IdeaHeaderCell')
);
const IdeaRowCell = React.lazy(() => import('./admin/components/IdeaRowCell'));
const Tab = React.lazy(() => import('./admin/components/Tab'));
const InputAssignment = React.lazy(() => import('./admin/containers/'));

const FeatureFlag = React.lazy(() => import('components/FeatureFlag'));

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

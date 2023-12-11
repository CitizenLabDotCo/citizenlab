import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { ModuleConfiguration } from 'utils/moduleUtils';
import useFeatureFlag from 'hooks/useFeatureFlag';

const AssigneeFilter = React.lazy(
  () => import('./admin/components/AssigneeFilter')
);
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
    'app.containers.Admin.project.edit.permissions.moderatorRights': (
      props
    ) => (
      <FeatureFlag name="idea_assignment">
        <InputAssignment {...props} />
      </FeatureFlag>
    ),
    'app.containers.Admin.projects.edit.settings': (props) => {
      return (
        <RenderOnTabHideCondition>
          <Tab {...props} />
        </RenderOnTabHideCondition>
      );
    },
  },
};

export default configuration;

import useFeatureFlag from 'hooks/useFeatureFlag';
import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import InitiativeSettingsTab from './admin/components/InitiativeSettingsTab';
import ProjectSettingsTab from './admin/components/ProjectSettingsTab';
import Granular from './admin/containers/Granular';
import FeatureFlag from 'components/FeatureFlag';

type RenderOnTabHideConditionProps = {
  children: ReactNode;
};

const RenderOnTabHideCondition = ({
  children,
}: RenderOnTabHideConditionProps) => {
  // Could be more than just a feature flag check,
  // hence we're not using the FeatureFlag component
  const isGranularPermissionsEnabled = useFeatureFlag({
    name: 'granular_permissions',
  });
  if (isGranularPermissionsEnabled) {
    return <>{children}</>;
  }
  return null;
};

const configuration: ModuleConfiguration = {
  routes: {
    'admin.initiatives': [
      {
        path: 'permissions',
        container: () => import('./admin/containers/permissions'),
      },
    ],
  },
  outlets: {
    'app.containers.Admin.project.edit.permissions.participationRights': (
      props
    ) => (
      <FeatureFlag name="granular_permissions">
        <Granular {...props} />
      </FeatureFlag>
    ),
    'app.containers.Admin.initiatives.tabs': (props) => (
      <InitiativeSettingsTab {...props} />
    ),
    'app.containers.Admin.projects.edit': (props) => {
      return (
        <RenderOnTabHideCondition>
          <ProjectSettingsTab {...props} />
        </RenderOnTabHideCondition>
      );
    },
  },
};

export default configuration;

import useFeatureFlag from 'hooks/useFeatureFlag';
import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
const InitiativeSettingsTab = React.lazy(
  () => import('./components/InitiativeSettingsTab')
);
const ProjectSettingsTab = React.lazy(
  () => import('./components/ProjectSettingsTab')
);
const PhasePermissions = React.lazy(
  () => import('./containers/Granular/PhasePermissions')
);
const Granular = React.lazy(() => import('./containers/Granular'));
const FeatureFlag = React.lazy(() => import('components/FeatureFlag'));

const AdminGranularPermissionsComponent = React.lazy(
  () => import('./containers/permissions')
);

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
        element: <AdminGranularPermissionsComponent />,
      },
    ],
  },
  outlets: {
    'app.containers.Admin.initiatives.tabs': (props) => (
      <InitiativeSettingsTab {...props} />
    ),
    'app.containers.Admin.projects.edit.settings': (props) => {
      return (
        <RenderOnTabHideCondition>
          <ProjectSettingsTab {...props} />
        </RenderOnTabHideCondition>
      );
    },
  },
};

export default configuration;

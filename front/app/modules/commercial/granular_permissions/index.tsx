import useFeatureFlag from 'hooks/useFeatureFlag';
import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
const InitiativeSettingsTab = React.lazy(
  () => import('./admin/components/InitiativeSettingsTab')
);
const ProjectSettingsTab = React.lazy(
  () => import('./admin/components/ProjectSettingsTab')
);
const Granular = React.lazy(() => import('./admin/containers/Granular'));
const FeatureFlag = React.lazy(() => import('components/FeatureFlag'));

const AdminGranularPermissionsComponent = React.lazy(
  () => import('./admin/containers/permissions')
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

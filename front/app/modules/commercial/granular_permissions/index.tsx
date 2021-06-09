import useFeatureFlag from 'hooks/useFeatureFlag';
import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import InitiativeSettingsTab from './admin/components/InitiativeSettingsTab';
import ProjectSettingsTab from './admin/components/ProjectSettingsTab';
import Granular from './admin/containers/Granular';
import { RenderOnFeatureFlag } from 'modules/utilComponents';

type RenderOnTabHideConditionProps = {
  children: ReactNode;
};

const RenderOnTabHideCondition = ({
  children,
}: RenderOnTabHideConditionProps) => {
  // could be the same as, but might diverge from RenderOnFeatureFlag
  const isGranularPermissionsEnabled = useFeatureFlag('granular_permissions');
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
      <RenderOnFeatureFlag featureFlagName="granular_permissions">
        <Granular {...props} />
      </RenderOnFeatureFlag>
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

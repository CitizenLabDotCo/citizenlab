import useFeatureFlag from 'hooks/useFeatureFlag';
import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import InitiativeSettingsTab from './admin/components/InitiativeSettingsTab';
import ProjectSettingsTab from './admin/components/ProjectSettingsTab';
import Granular from './admin/containers/Granular';

type RenderOnFeatureFlagProps = {
  children: ReactNode;
};

type RenderOnTabHideConditionProps = {
  children: ReactNode;
};

const RenderOnFeatureFlag = ({ children }: RenderOnFeatureFlagProps) => {
  const isGranularPermissionsEnabled = useFeatureFlag('granular_permissions');
  if (isGranularPermissionsEnabled) {
    return <>{children}</>;
  }
  return null;
};

const RenderOnTabHideCondition = ({ children }: RenderOnTabHideConditionProps) => {
  // currently the same as RenderOnFeatureFlag, but wanted to make clear
  // there's a difference and RenderOnTabHideCondition might diverge from RenderOnFeatureFlag
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
      <RenderOnFeatureFlag>
        <Granular {...props} />
      </RenderOnFeatureFlag>
    ),
    'app.containers.Admin.initiatives.tabs': (props) => (
      <InitiativeSettingsTab {...props} />
    ),
    'app.containers.Admin.projects.edit': (props) => {
      return (
        <RenderOnFeatureFlag>
          <RenderOnTabHideCondition>
            <ProjectSettingsTab {...props} />
          </RenderOnTabHideCondition>
        </RenderOnFeatureFlag>
      );
    },
  },
};

export default configuration;

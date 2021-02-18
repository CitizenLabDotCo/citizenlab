import useFeatureFlag from 'hooks/useFeatureFlag';
import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import Tab from './admin/components/Tab';
import Granular from './admin/containers/Granular';

type RenderOnFeatureFlagProps = {
  children: ReactNode;
};

const RenderOnFeatureFlag = ({ children }: RenderOnFeatureFlagProps) => {
  const isEnabled = useFeatureFlag('custom_idea_statuses');
  if (isEnabled) {
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
    'app.containers.Admin.project.edit.permissions': (props) => (
      <RenderOnFeatureFlag>
        <Granular {...props} />
      </RenderOnFeatureFlag>
    ),
    'app.containers.Admin.ideas.tabs': (props) => {
      return (
        <RenderOnFeatureFlag>
          <Tab {...props} />
        </RenderOnFeatureFlag>
      );
    },
  },
};

export default configuration;

import useFeatureFlag from 'hooks/useFeatureFlag';
import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import GuideArticle from './admin/components/GuideArticle';
import Tab from './admin/components/Tab';

type RenderOnFeatureFlagProps = {
  children: ReactNode;
};

const RenderOnFeatureFlag = ({ children }: RenderOnFeatureFlagProps) => {
  const isGranularPermissionsEnabled = useFeatureFlag('widgets');
  if (isGranularPermissionsEnabled) {
    return <>{children}</>;
  }
  return null;
};

const configuration: ModuleConfiguration = {
  routes: {
    'admin.settings': [
      {
        path: 'widgets',
        name: 'widgets',
        container: () => import('./admin/containers'),
      },
    ],
  },
  outlets: {
    'app.containers.Admin.guide.SetupSection': () => (
      <RenderOnFeatureFlag>
        <GuideArticle />
      </RenderOnFeatureFlag>
    ),
    'app.containers.Admin.settings.tabs': (props) => <Tab {...props} />,
  },
};

export default configuration;

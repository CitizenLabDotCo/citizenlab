import { ModuleConfiguration } from 'utils/moduleUtils';
import React, { ReactNode } from 'react';
import NavItem from './admin/components/NavItem';
import FlagInnapropriateContentForm from './admin/containers/FlagInnapropriateContentForm';
import useFeatureFlag from 'hooks/useFeatureFlag';

type RenderOnFeatureFlagProps = {
  children: ReactNode;
};

const RenderOnFeatureFlag = ({ children }: RenderOnFeatureFlagProps) => {
  const isEnabled = useFeatureFlag('moderation');
  if (isEnabled) {
    return <>{children}</>;
  }
  return null;
};

const configuration: ModuleConfiguration = {
  routes: {
    admin: [
      {
        path: 'moderation',
        name: 'moderation',
        container: () => import('./admin/containers'),
      },
    ],
  },
  outlets: {
    'app.containers.Admin.sideBar.navItems': (props) => <NavItem {...props} />,
    'app.containers.Admin.settings.general.form': (props) => (
      <RenderOnFeatureFlag>
        <FlagInnapropriateContentForm {...props} />
      </RenderOnFeatureFlag>
    ),
  },
};

export default configuration;

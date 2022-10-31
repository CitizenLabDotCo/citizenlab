import { NavItem } from 'containers/Admin/sideBar';
import { FC, useEffect } from 'react';
import { InsertConfigurationOptions } from 'typings';
import useFeatureFlag from 'hooks/useFeatureFlag';

type Props = {
  onData: (data: InsertConfigurationOptions<NavItem>) => void;
};

const NavItemComponent: FC<Props> = ({ onData }) => {
  const insightsManualFlow = useFeatureFlag({ name: 'insights_manual_flow' });

  useEffect(() => {
    onData({
      configuration: {
        name: 'insights',
        link: `/admin/insights${insightsManualFlow ? '' : '/reports'}`,
        iconName: 'sidebar-reporting',
        message: 'insights',
        featureNames: insightsManualFlow
          ? ['insights_manual_flow']
          : ['project_reports'],
      },
      insertAfterName: 'projects',
    });
  }, [onData, insightsManualFlow]);
  return null;
};

export default NavItemComponent;

import { NavItem } from 'containers/Admin/sideBar';
import { FC, useEffect } from 'react';
import { getUrlLocale } from 'services/locale';
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
        iconName: 'processing',
        message: 'insights',
        featureName: insightsManualFlow
          ? 'insights_manual_flow'
          : 'project_reports',
        isActive: (pathName) =>
          pathName.startsWith(
            `${
              getUrlLocale(pathName) ? `/${getUrlLocale(pathName)}` : ''
            }/admin/insights`
          ),
      },
      insertAfterName: 'projects',
    });
  }, [onData, insightsManualFlow]);
  return null;
};

export default NavItemComponent;

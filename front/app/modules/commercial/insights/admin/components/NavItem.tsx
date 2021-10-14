import { NavItem } from 'containers/Admin/sideBar';
import { FC, useEffect } from 'react';
import { getUrlLocale } from 'services/locale';
import { InsertConfigurationOptions } from 'typings';
import useFeatureFlag from 'hooks/useFeatureFlag';

type Props = {
  onData: (data: InsertConfigurationOptions<NavItem>) => void;
};

const NavItemComponent: FC<Props> = ({ onData }) => {
  const projectReports = useFeatureFlag('project_reports');

  useEffect(() => {
    onData({
      configuration: {
        name: 'insights',
        link: `/admin/insights${projectReports ? '/reports' : ''}`,
        iconName: 'processing',
        message: 'insights',
        featureName: projectReports
          ? 'project_reports'
          : 'insights_manual_flow',
        isActive: (pathName) =>
          pathName.startsWith(
            `${
              getUrlLocale(pathName) ? `/${getUrlLocale(pathName)}` : ''
            }/admin/insights`
          ),
      },
      insertAfterName: 'projects',
    });
  }, [onData, projectReports]);
  return null;
};

export default NavItemComponent;

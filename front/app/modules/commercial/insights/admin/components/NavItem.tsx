import { NavItem } from 'containers/Admin/sideBar';
import { FC, useEffect } from 'react';
import { InsertConfigurationOptions } from 'typings';

type Props = {
  onData: (data: InsertConfigurationOptions<NavItem>) => void;
};

const NavItemComponent: FC<Props> = ({ onData }) => {
  useEffect(() => {
    onData({
      configuration: {
        name: 'insights',
        link: `/admin/insights'/reports`,
        iconName: 'sidebar-reporting',
        message: 'insights',
        featureNames: ['project_reports'],
      },
      insertAfterName: 'projects',
    });
  }, [onData]);
  return null;
};

export default NavItemComponent;

import { NavItem } from 'containers/Admin/sideBar/navItems';
import { FC, useEffect } from 'react';
import { InsertConfigurationOptions } from 'typings';

type Props = {
  onData: (data: InsertConfigurationOptions<NavItem>) => void;
};

const NavItemComponent: FC<Props> = ({ onData }) => {
  useEffect(
    () =>
      onData({
        configuration: {
          name: 'moderation',
          link: '/admin/moderation',
          iconName: 'sidebar-activity',
          message: 'moderation',
          featureNames: ['moderation'],
        },
        insertAfterName: 'dashboard',
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return null;
};

export default NavItemComponent;

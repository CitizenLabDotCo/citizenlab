import { NavItem } from 'containers/Admin/sideBar';
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
          name: 'menu',
          link: '/admin/pages-menu',
          iconName: 'blankPage',
          message: 'menu',
          featureNames: ['customizable_navbar'],
        },
        insertBeforeName: 'settings',
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return null;
};

export default NavItemComponent;

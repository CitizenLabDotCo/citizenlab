import { NavItem } from 'containers/Admin/sideBar';
import { FC, useEffect } from 'react';
import { getUrlLocale } from 'services/locale';
import { InsertConfigurationOptions } from 'typings';

type Props = {
  onData: (data: InsertConfigurationOptions<NavItem>) => void;
};

const NavItemComponent: FC<Props> = ({ onData }) => {
  useEffect(
    () =>
      onData({
        configuration: {
          name: 'processing',
          link: '/admin/processing',
          iconName: 'processing',
          featureName: 'manual_tagging',
          message: 'processing',
          isActive: (pathName) =>
            pathName.startsWith(
              `${
                getUrlLocale(pathName) ? `/${getUrlLocale(pathName)}` : ''
              }/admin/processing`
            ),
        },
        insertAfterName: 'dashboard',
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return null;
};

export default NavItemComponent;

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
          name: 'moderation',
          link: '/admin/moderation',
          iconName: 'moderation',
          message: 'moderation',
          featureName: 'moderation',
          isActive: (pathName) =>
            pathName.startsWith(
              `${
                getUrlLocale(pathName) ? `/${getUrlLocale(pathName)}` : ''
              }/admin/moderation`
            ),
        },
        insertAfterName: 'insights',
      }),
    []
  );
  return null;
};

export default NavItemComponent;

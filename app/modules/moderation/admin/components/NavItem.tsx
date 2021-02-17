import { NavItem } from 'containers/Admin/sideBar';
import { FC, useEffect } from 'react';
import { getUrlLocale } from 'services/locale';

type Props = {
  onData: (data: {
    insertAfterNavItemId?: string;
    navItemConfiguration: NavItem;
  }) => void;
};

const NavItemComponent: FC<Props> = ({ onData }) => {
  useEffect(
    () =>
      onData({
        navItemConfiguration: {
          id: 'moderation',
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
        insertAfterNavItemId: 'insights',
      }),
    []
  );
  return null;
};

export default NavItemComponent;

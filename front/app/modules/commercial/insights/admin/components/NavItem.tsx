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
          name: 'insights',
          link: '/admin/insights',
          iconName: 'processing',
          message: 'insights',
          featureName: 'insights_manual_flow',
          isActive: (pathName) =>
            pathName.startsWith(
              `${
                getUrlLocale(pathName) ? `/${getUrlLocale(pathName)}` : ''
              }/admin/insights`
            ),
        },
        insertAfterName: 'projects',
      }),
    [onData]
  );
  return null;
};

export default NavItemComponent;

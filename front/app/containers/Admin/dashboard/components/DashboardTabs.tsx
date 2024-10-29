import React from 'react';

import { useLocation } from 'react-router-dom';
import { ITab } from 'typings';

import NavigationTabs, {
  Tab,
  TabsPageLayout,
} from 'components/admin/NavigationTabs';

import { isTopBarNavActive } from 'utils/helperUtils';

interface Props {
  children?: React.ReactNode;
  tabs?: ITab[];
}

const DashboardTabs = ({ children, tabs }: Props) => {
  const location = useLocation();

  return (
    <>
      {tabs && tabs.length > 0 && (
        <NavigationTabs>
          {tabs.map((tab) => {
            const active = isTopBarNavActive(
              '/admin/dashboard',
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              location?.pathname,
              tab.url
            );

            const classes = [tab.name, active ? 'active' : ''].join(' ');

            return (
              <Tab
                label={tab.label}
                url={tab.url}
                key={tab.url}
                active={active}
                className={`${classes} intercom-admin-dashboard-tab-${tab.name}`}
              />
            );
          })}
        </NavigationTabs>
      )}

      <TabsPageLayout>{children}</TabsPageLayout>
    </>
  );
};

export default DashboardTabs;

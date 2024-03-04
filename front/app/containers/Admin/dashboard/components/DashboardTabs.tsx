import React from 'react';

// routing
import { useLocation } from 'react-router-dom';

import NavigationTabs, {
  Tab,
  TabsPageLayout,
} from 'components/admin/NavigationTabs';

import { isTopBarNavActive } from 'utils/helperUtils';

import { ITab } from 'typings';

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

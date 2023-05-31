import React, { memo, useMemo } from 'react';

import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// typings
import { ITab } from 'typings';

// components
import FeatureFlag from 'components/FeatureFlag';
import NavigationTabs, {
  Tab,
  TabsPageLayout,
} from 'components/admin/NavigationTabs';

// utils
import { isTopBarNavActive } from 'utils/helperUtils';

interface Props {
  children?: React.ReactNode;
  resource: {
    title: string;
    subtitle?: string;
  };
  tabs?: ITab[];
}

const DashboardTabs = memo<Props & WithRouterProps>(
  ({ children, tabs, location }) => {
    return (
      <>
        {tabs &&
          tabs.length > 0 &&
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useMemo(
            () => (
              <NavigationTabs className="e2e-resource-tabs">
                {tabs.map((tab) => {
                  const active = isTopBarNavActive(
                    '/admin/dashboard',
                    location?.pathname,
                    tab.url
                  );
                  const classes = [tab.name, active ? 'active' : ''].join(' ');

                  if (tab.feature) {
                    return (
                      <FeatureFlag key={tab.url} name={tab.feature}>
                        <Tab
                          label={tab.label}
                          url={tab.url}
                          key={tab.url}
                          active={active}
                          className={`${classes} intercom-admin-dashboard-tab-${tab.name}`}
                        />
                      </FeatureFlag>
                    );
                  } else {
                    return (
                      <Tab
                        label={tab.label}
                        url={tab.url}
                        key={tab.url}
                        active={active}
                        className={`${classes} intercom-admin-dashboard-tab-${tab.name}`}
                      />
                    );
                  }
                })}
              </NavigationTabs>
            ),
            [tabs, location]
          )}

        <TabsPageLayout>{children}</TabsPageLayout>
      </>
    );
  }
);

export default withRouter(DashboardTabs);

import React, { memo, useMemo } from 'react';

import { withRouter, WithRouterProps } from 'react-router';
import Link from 'utils/cl-router/Link';

// typings
import { ITab } from 'typings';

// components
import FeatureFlag from 'components/FeatureFlag';
import NavigationTabs, {
  Tab,
  TabsPageLayout,
} from 'components/admin/NavigationTabs';

// utils
import { matchPathToUrl } from 'utils/helperUtils';

interface Props {
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
                  const active = Boolean(
                    location?.pathname &&
                      matchPathToUrl(tab.url).test(location.pathname)
                  );

                  const classes = [tab.name, active ? 'active' : ''].join(' ');

                  if (tab.feature) {
                    return (
                      <FeatureFlag key={tab.url} name={tab.feature}>
                        <Tab key={tab.url} active={active} className={classes}>
                          <Link to={tab.url}>{tab.label}</Link>
                        </Tab>
                      </FeatureFlag>
                    );
                  } else {
                    return (
                      <Tab key={tab.url} active={active} className={classes}>
                        <Link to={tab.url}>{tab.label}</Link>
                      </Tab>
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

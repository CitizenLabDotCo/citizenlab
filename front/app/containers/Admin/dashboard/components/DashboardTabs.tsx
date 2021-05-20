import React, { memo, useMemo } from 'react';

import { withRouter, WithRouterProps } from 'react-router';
import Link from 'utils/cl-router/Link';

// typings
import { Message, ITab } from 'typings';

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
    publicLink?: string;
    subtitle?: string;
  };
  messages?: {
    viewPublicResource: Message;
  };
  tabs?: ITab[];
}

const DashboardTabs = memo<Props & WithRouterProps>(
  ({ children, tabs, location }) => {
    return (
      <>
        {tabs &&
          tabs.length > 0 &&
          useMemo(
            () => (
              <NavigationTabs className="e2e-resource-tabs">
                {tabs.map((tab) => {
                  if (tab.feature) {
                    return (
                      <FeatureFlag key={tab.url} name={tab.feature}>
                        <Tab
                          key={tab.url}
                          active={Boolean(
                            location?.pathname &&
                              matchPathToUrl(tab.url).test(location.pathname)
                          )}
                          className={tab.name}
                        >
                          <Link to={tab.url}>{tab.label}</Link>
                        </Tab>
                      </FeatureFlag>
                    );
                  } else {
                    return (
                      <Tab
                        key={tab.url}
                        active={Boolean(
                          location?.pathname &&
                            matchPathToUrl(tab.url).test(location.pathname)
                        )}
                        className={tab.name}
                      >
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

import React from 'react';

import Link from 'utils/cl-router/Link';
import { withRouter, WithRouterProps } from 'react-router';

// components
import NavigationTabs, { Tab, TabsPageLayout } from 'components/NavigationTabs';

// utils
import { matchPathToUrl } from 'utils/helperUtils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

const tabs = [
  { label: messages.tabInsights, url: '/admin/insights' },
  { label: messages.tabReports, url: '/admin/insights/reports' },
];

const Insights: React.FC<InjectedIntlProps & WithRouterProps> = ({
  location,
  intl: { formatMessage },
  children,
}) => {
  return (
    <div>
      <NavigationTabs>
        {tabs.map((tab) => (
          <Tab
            active={Boolean(
              location?.pathname &&
                matchPathToUrl(tab.url).test(location.pathname)
            )}
          >
            <Link to={tab.url}>{formatMessage(tab.label)}</Link>
          </Tab>
        ))}
      </NavigationTabs>
      <TabsPageLayout>{children}</TabsPageLayout>
    </div>
  );
};

export default withRouter(injectIntl(Insights));

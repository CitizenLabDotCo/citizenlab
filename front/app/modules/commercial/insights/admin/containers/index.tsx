import React from 'react';
import { WrappedComponentProps } from 'react-intl';
import { Outlet as RouterOutlet } from 'react-router-dom';
// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
// i18n
import { injectIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
// utils
import { matchPathToUrl } from 'utils/helperUtils';
// components
import HelmetIntl from 'components/HelmetIntl';
import NavigationTabs, {
  Tab,
  TabsPageLayout,
} from 'components/admin/NavigationTabs';
import messages from '../../messages';

const Insights: React.FC<WrappedComponentProps & WithRouterProps> = ({
  location: { pathname },
  intl: { formatMessage },
}) => {
  const projectReportsFeatureFlag = useFeatureFlag({ name: 'project_reports' });
  const manualInsightsFeatureFlag = useFeatureFlag({
    name: 'insights_manual_flow',
  });
  const tabs = [
    ...(manualInsightsFeatureFlag
      ? [{ label: messages.tabInsights, url: '/admin/insights' }]
      : []),
    ...(projectReportsFeatureFlag
      ? [{ label: messages.tabReports, url: '/admin/insights/reports' }]
      : []),
  ];
  return (
    <div id="e2e-insights-container">
      <HelmetIntl
        title={messages.helmetTitle}
        description={messages.helmetDescription}
      />
      {tabs.some(
        (tab) =>
          matchPathToUrl(tab.url).test(pathname) ||
          pathname.includes('/reports/')
      ) ? (
        <>
          <NavigationTabs>
            {tabs.map((tab) => (
              <Tab
                key={tab.url}
                active={matchPathToUrl(tab.url).test(pathname)}
              >
                <Link to={tab.url}>{formatMessage(tab.label)}</Link>
              </Tab>
            ))}
          </NavigationTabs>
          <TabsPageLayout>
            <RouterOutlet />
          </TabsPageLayout>
        </>
      ) : (
        <RouterOutlet />
      )}
    </div>
  );
};

export default withRouter(injectIntl(Insights));

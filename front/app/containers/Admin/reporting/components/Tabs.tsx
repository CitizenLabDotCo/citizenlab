import React, { useState, useMemo, useEffect } from 'react';

// hooks
import { useLocation } from 'react-router-dom';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// components
import NavigationTabs, {
  Tab,
  TabsPageLayout,
} from 'components/admin/NavigationTabs';
import Link from 'utils/cl-router/Link';
import Outlet from 'components/Outlet';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

// typings
import { ITab } from 'typings';

interface Props {
  showReportBuilderTab: boolean;
  children?: React.ReactNode;
}

const removeTrailingSlash = (str: string) => {
  if (str[str.length - 1] === '/') return str.slice(0, str.length - 1);
  return str;
};

const DashboardTabs = ({ showReportBuilderTab, children }: Props) => {
  const { pathname } = useLocation();
  const { formatMessage } = useIntl();

  const [additionalTabs, setAdditionalTabs] = useState<ITab[]>([]);
  const [redirected, setRedirected] = useState(false);

  const tabs = useMemo(
    () => [
      ...(showReportBuilderTab
        ? [
            {
              label: formatMessage(messages.reportBuilder),
              url: '/admin/reporting/report-builder',
              name: 'report_builder',
            },
          ]
        : []),
      ...additionalTabs,
    ],
    [showReportBuilderTab, additionalTabs, formatMessage]
  );

  useEffect(() => {
    if (redirected) return;
    if (tabs.length === 0) return;
    if (removeTrailingSlash(pathname).endsWith('/admin/reporting')) {
      clHistory.push(tabs[0].url);
    }

    setRedirected(true);
  }, [redirected, tabs, pathname]);

  return (
    <>
      <NavigationTabs>
        {tabs.map(({ url, label }) => (
          <Tab key={url} active={pathname.includes(url)}>
            <Link to={url}>{label}</Link>
          </Tab>
        ))}
      </NavigationTabs>
      <TabsPageLayout>{children}</TabsPageLayout>
      <Outlet
        id="app.containers.Admin.reporting.components.Tabs"
        onData={setAdditionalTabs}
      />
    </>
  );
};

const DashboardTabsWrapper = ({ children }: { children: React.ReactNode }) => {
  const appConfig = useAppConfiguration();
  const isFeatureEnabled = useFeatureFlag({ name: 'report_builder' });
  const isFeatureAllowed = useFeatureFlag({
    name: 'report_builder',
    onlyCheckAllowed: true,
  });

  // We need to wait for the appConfig to be loaded before we can check for allowed and enabled
  // This is particularly important for the first load of the page where we don't want a wrong url set
  if (isNilOrError(appConfig)) {
    return null;
  }

  // If the feature is not allowed by the pricing plan,
  // we want to show an info message about this, which requires seeing the tab
  const showPlanUpgradeTease = !isFeatureAllowed;
  const showReportBuilderTab = showPlanUpgradeTease || isFeatureEnabled;

  return (
    <DashboardTabs showReportBuilderTab={showReportBuilderTab}>
      {children}
    </DashboardTabs>
  );
};

export default DashboardTabsWrapper;

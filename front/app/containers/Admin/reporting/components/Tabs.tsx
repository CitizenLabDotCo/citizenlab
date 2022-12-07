import React, { useState, useMemo, useEffect } from 'react';

// hooks
import { useLocation } from 'react-router-dom';
import useFeatureFlag from 'hooks/useFeatureFlag';

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
import { matchPathToUrl } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

// typings
import { ITab } from 'typings';

interface Props {
  reportBuilderEnabled: boolean;
  children?: React.ReactNode;
}

const DashboardTabs = ({ reportBuilderEnabled, children }: Props) => {
  const { pathname } = useLocation();
  const { formatMessage } = useIntl();

  const [additionalTabs, setAdditionalTabs] = useState<ITab[]>([]);
  const [redirected, setRedirected] = useState(false);

  const tabs = useMemo(
    () => [
      ...(reportBuilderEnabled
        ? [
            {
              label: formatMessage(messages.reportCreator),
              url: '/admin/reporting/report-creator',
              name: 'report_creator',
            },
          ]
        : []),
      ...additionalTabs,
    ],
    [reportBuilderEnabled, additionalTabs]
  );

  useEffect(() => {
    if (redirected) return;
    if (tabs.length === 0) return;

    clHistory.push(tabs[0].url);
    setRedirected(true);
  }, [redirected, tabs]);

  if (reportBuilderEnabled === undefined) return null;

  return (
    <>
      <NavigationTabs>
        {tabs.map(({ url, label }) => (
          <Tab key={url} active={matchPathToUrl(url).test(pathname)}>
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
  const reportBuilderEnabled = useFeatureFlag({ name: 'report_builder' });
  if (reportBuilderEnabled === undefined) return null;

  return (
    <DashboardTabs reportBuilderEnabled={reportBuilderEnabled}>
      {children}
    </DashboardTabs>
  );
};

export default DashboardTabsWrapper;

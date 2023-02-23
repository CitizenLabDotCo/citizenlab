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
  children?: React.ReactNode;
}

const removeTrailingSlash = (str: string) => {
  if (str[str.length - 1] === '/') return str.slice(0, str.length - 1);
  return str;
};

const DashboardTabs = ({ children }: Props) => {
  const reportBuilderAllowedAndEnabled = useFeatureFlag({
    name: 'report_builder',
  });
  const reportBuilderNotAllowed = useFeatureFlag({
    name: 'report_builder',
    onlyCheckAllowed: true,
  });

  const { pathname } = useLocation();
  const { formatMessage } = useIntl();

  const [additionalTabs, setAdditionalTabs] = useState<ITab[]>([]);
  const [redirected, setRedirected] = useState(false);

  const showReportBuilderTab =
    reportBuilderAllowedAndEnabled || reportBuilderNotAllowed;

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

export default DashboardTabs;

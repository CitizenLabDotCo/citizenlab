import React, { useState, useEffect } from 'react';

import { Box, Badge, colors } from '@citizenlab/cl2-component-library';
import { useLocation } from 'react-router-dom';
import { ITab } from 'typings';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useFeatureFlag from 'hooks/useFeatureFlag';

import NavigationTabs, {
  Tab,
  TabsPageLayout,
} from 'components/admin/NavigationTabs';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isNilOrError, isTopBarNavActive } from 'utils/helperUtils';

import messages from '../messages';

interface Props {
  showReportBuilderTab: boolean;
  showProjectReportsTab: boolean;
  children?: React.ReactNode;
}

const removeTrailingSlash = (str: string) => {
  if (str[str.length - 1] === '/') return str.slice(0, str.length - 1);
  return str;
};

const DashboardTabs = ({
  showReportBuilderTab,
  showProjectReportsTab,
  children,
}: Props) => {
  const { pathname } = useLocation();
  const { formatMessage } = useIntl();

  const [redirected, setRedirected] = useState(false);

  const [tabs] = useState(() => {
    const reportBuilderTab: ITab = {
      label: formatMessage(messages.reportBuilder),
      url: '/admin/reporting/report-builder',
      name: 'report_builder',
    };

    const projectReportsTab: ITab = {
      label: formatMessage(messages.tabReports),
      url: '/admin/reporting/reports',
      name: 'project_reports',
    };

    return [
      ...(showReportBuilderTab ? [reportBuilderTab] : []),
      ...(showProjectReportsTab ? [projectReportsTab] : []),
    ];
  });

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
        {tabs.map(({ url, label, name }) => (
          <Tab
            label={label}
            url={url}
            key={url}
            active={isTopBarNavActive('/admin/reporting', pathname, url)}
            badge={
              name === 'project_reports' ? (
                <Box display="inline" ml="12px">
                  <Badge color={colors.textSecondary} className="inverse">
                    {formatMessage(messages.deprecated)}
                  </Badge>
                </Box>
              ) : null
            }
          />
        ))}
      </NavigationTabs>
      <TabsPageLayout>{children}</TabsPageLayout>
    </>
  );
};

const DashboardTabsWrapper = ({ children }: { children: React.ReactNode }) => {
  const appConfig = useAppConfiguration();
  const isReportBuilderEnabled = useFeatureFlag({ name: 'report_builder' });
  const isReportBuilderAllowed = useFeatureFlag({
    name: 'report_builder',
    onlyCheckAllowed: true,
  });
  const projectReportsEnabled = useFeatureFlag({ name: 'project_reports' });

  // We need to wait for the appConfig to be loaded before we can check for allowed and enabled
  // This is particularly important for the first load of the page where we don't want a wrong url set
  if (isNilOrError(appConfig)) {
    return null;
  }

  // If the feature is not allowed by the pricing plan,
  // we want to show an info message about this, which requires seeing the tab
  const showPlanUpgradeTease = !isReportBuilderAllowed;
  const showReportBuilderTab = showPlanUpgradeTease || isReportBuilderEnabled;

  return (
    <DashboardTabs
      showReportBuilderTab={showReportBuilderTab}
      showProjectReportsTab={projectReportsEnabled}
    >
      {children}
    </DashboardTabs>
  );
};

export default DashboardTabsWrapper;

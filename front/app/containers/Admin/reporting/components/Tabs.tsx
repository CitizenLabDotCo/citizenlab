import React, { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

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

// typings
import { ITab } from 'typings';

interface Props {
  children?: React.ReactNode;
}

const DashboardTabs = ({ children }: Props) => {
  const { pathname } = useLocation();
  const { formatMessage } = useIntl();

  const [tabs, setTabs] = useState<ITab[]>([
    {
      label: formatMessage(messages.reportCreator),
      url: '/admin/reporting/report-creator',
      name: 'report_creator',
    },
  ]);

  const handleData = useCallback((newTabs: ITab[]) => {
    setTabs((tabs) => [...tabs, ...newTabs]);
  }, []);

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
        onData={handleData}
      />
    </>
  );
};

export default DashboardTabs;

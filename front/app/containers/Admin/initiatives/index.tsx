import React, { useState } from 'react';
import { Outlet as RouterOutlet, useLocation } from 'react-router-dom';

// components
import HelmetIntl from 'components/HelmetIntl';
import NavigationTabs, {
  Tab,
  TabsPageLayout,
} from 'components/admin/NavigationTabs';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// styles
import { InsertConfigurationOptions, ITab } from 'typings';
import Outlet from 'components/Outlet';
import { insertConfiguration } from 'utils/moduleUtils';

// utils
import { isTopBarNavActive } from 'utils/helperUtils';

const InitiativesPage = () => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();

  const [tabs, setTabs] = useState<ITab[]>([
    {
      label: formatMessage(messages.overviewTab),
      name: 'proposals',
      url: '/admin/initiatives',
    },
    {
      label: formatMessage(messages.settingsTab),
      name: 'settings',
      url: '/admin/initiatives/settings',
    },
  ]);

  const handleData = (data: InsertConfigurationOptions<ITab>) =>
    setTabs(insertConfiguration<ITab>(data));

  return (
    <>
      <Outlet
        id="app.containers.Admin.initiatives.tabs"
        onData={handleData}
        formatMessage={formatMessage}
      />
      <NavigationTabs>
        {tabs.map(({ url, label }) => (
          <Tab
            label={label}
            url={url}
            key={url}
            active={isTopBarNavActive('/admin/initiatives', pathname, url)}
          />
        ))}
      </NavigationTabs>

      <TabsPageLayout>
        <HelmetIntl
          title={messages.metaTitle}
          description={messages.metaDescription}
        />
        <div id="e2e-initiatives-admin-container">
          <RouterOutlet />
        </div>
      </TabsPageLayout>
    </>
  );
};
export default InitiativesPage;

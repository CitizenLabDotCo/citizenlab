import React, { useState } from 'react';

// module

import { Outlet as RouterOutlet, useLocation } from 'utils/router';
import { InsertConfigurationOptions, ITab } from 'typings';

import NavigationTabs, {
  Tab,
  TabsPageLayout,
} from 'components/admin/NavigationTabs';
import HelmetIntl from 'components/HelmetIntl';
import Outlet from 'components/Outlet';

import { useIntl } from 'utils/cl-intl';
import { isTopBarNavActive } from 'utils/helperUtils';
import { insertConfiguration } from 'utils/moduleUtils';

import messages from './messages';

const IdeasPage = () => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  const [tabs, setTabs] = useState<ITab[]>([
    {
      label: formatMessage(messages.tabOverview),
      name: 'manage',
      url: '/admin/ideas',
    },
  ]);

  const handleData = (data: InsertConfigurationOptions<ITab>) => {
    setTabs((tabs) => insertConfiguration(data)(tabs));
  };

  return (
    <>
      <Outlet
        id="app.containers.Admin.ideas.tabs"
        formatMessage={formatMessage}
        onData={handleData}
      />
      <NavigationTabs>
        {tabs.map(({ url, label }) => (
          <Tab
            label={label}
            url={url}
            key={url}
            active={isTopBarNavActive('/admin/ideas', pathname, url)}
          />
        ))}
      </NavigationTabs>

      <TabsPageLayout>
        <HelmetIntl
          title={messages.inputManagerMetaTitle}
          description={messages.inputManagerMetaDescription}
        />

        <div id="e2e-input-manager-container">
          <RouterOutlet />
        </div>
      </TabsPageLayout>
    </>
  );
};

export default IdeasPage;

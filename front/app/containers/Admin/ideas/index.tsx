import React, { useState } from 'react';

// module
import { InsertConfigurationOptions, ITab } from 'typings';
import { insertConfiguration } from 'utils/moduleUtils';

// components
import HelmetIntl from 'components/HelmetIntl';
import Outlet from 'components/Outlet';
import { Outlet as RouterOutlet, useLocation } from 'react-router-dom';
import NavigationTabs, {
  Tab,
  TabsPageLayout,
} from 'components/admin/NavigationTabs';
import Link from 'utils/cl-router/Link';
import { isTopBarNavActive } from 'utils/helperUtils';
import { useIntl } from 'utils/cl-intl';

// i18n
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
          >
            <Link to={url}>{label}</Link>
          </Tab>
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

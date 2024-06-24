import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Outlet as RouterOutlet, useLocation } from 'react-router-dom';
import { RouteType } from 'routes';

import NavigationTabs, {
  Tab,
  TabsPageLayout,
} from 'components/admin/NavigationTabs';
import HelmetIntl from 'components/HelmetIntl';

import { useIntl } from 'utils/cl-intl';
import { isTopBarNavActive } from 'utils/helperUtils';

import messages from './messages';

const MessagingDashboard = () => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();

  const getTabs = () => {
    const tabs: {
      name: string;
      label: string;
      url: RouteType;
      statusLabel?: string;
    }[] = [];

    tabs.push({
      name: 'manual-emails',
      label: formatMessage(messages.customEmails),
      url: '/admin/messaging/emails/custom',
    });
    tabs.push({
      name: 'automated-emails',
      label: formatMessage(messages.tabAutomatedEmails),
      url: '/admin/messaging/emails/automated',
    });

    return tabs;
  };

  const tabs = getTabs();

  return (
    <>
      <HelmetIntl
        title={messages.helmetTitle}
        description={messages.helmetDescription}
      />
      <NavigationTabs>
        {tabs.map(({ url, label }) => (
          <Tab
            label={label}
            url={url}
            key={url}
            active={isTopBarNavActive('/admin/messaging', pathname, url)}
          />
        ))}
      </NavigationTabs>
      <TabsPageLayout>
        <Box id="e2e-messaging-container">
          <RouterOutlet />
        </Box>
      </TabsPageLayout>
    </>
  );
};

export default MessagingDashboard;

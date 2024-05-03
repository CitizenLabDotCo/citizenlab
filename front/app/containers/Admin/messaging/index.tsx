import React, { useEffect } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Outlet as RouterOutlet, useLocation } from 'react-router-dom';
import { RouteType } from 'routes';

import useFeatureFlag from 'hooks/useFeatureFlag';

import NavigationTabs, {
  Tab,
  TabsPageLayout,
} from 'components/admin/NavigationTabs';
import HelmetIntl from 'components/HelmetIntl';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isTopBarNavActive } from 'utils/helperUtils';
import { usePermission } from 'utils/permissions';

import messages from './messages';

const MessagingDashboard = () => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  const canManageAutomatedCampaigns = usePermission({
    action: 'manage',
    item: 'automatedCampaign',
  });
  const canManageManualCampaigns = usePermission({
    action: 'manage',
    item: 'manualCampaign',
  });
  const textingEnabled = useFeatureFlag({ name: 'texting' });

  useEffect(() => {
    if (!pathname.match(/\/admin\/messaging$/)) {
      return;
    }

    const redirect = (url: string) => {
      clHistory.replace({
        pathname: url,
        search: window.location.search,
      });
    };

    if (canManageManualCampaigns) {
      return redirect('/admin/messaging/emails/custom');
    }
    if (canManageAutomatedCampaigns) {
      return redirect('/admin/messaging/emails/automated');
    }
    if (textingEnabled) {
      return redirect('/admin/messaging/texting');
    }
  }, [
    pathname,
    canManageManualCampaigns,
    canManageAutomatedCampaigns,
    textingEnabled,
  ]);

  if (!canManageAutomatedCampaigns || !canManageManualCampaigns) {
    return null;
  }

  const getTabs = () => {
    const tabs: {
      name: string;
      label: string;
      url: RouteType;
      statusLabel?: string;
    }[] = [];

    if (canManageManualCampaigns) {
      tabs.push({
        name: 'manual-emails',
        label: formatMessage(messages.customEmails),
        url: '/admin/messaging/emails/custom',
      });
    }
    if (canManageAutomatedCampaigns) {
      tabs.push({
        name: 'automated-emails',
        label: formatMessage(messages.tabAutomatedEmails),
        url: '/admin/messaging/emails/automated',
      });
    }
    if (textingEnabled) {
      tabs.push({
        name: 'texting',
        label: formatMessage(messages.tabTexting),
        url: '/admin/messaging/texting',
      });
    }

    return tabs;
  };

  const tabs = getTabs();

  return (
    <>
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
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        <Box id="e2e-messaging-container">
          <RouterOutlet />
        </Box>
      </TabsPageLayout>
    </>
  );
};

export default MessagingDashboard;

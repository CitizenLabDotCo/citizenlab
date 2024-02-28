import React, { useEffect } from 'react';
import clHistory from 'utils/cl-router/history';
import { useIntl } from 'utils/cl-intl';
import HelmetIntl from 'components/HelmetIntl';
import { Box, StatusLabel, colors } from '@citizenlab/cl2-component-library';
import messages from './messages';
import { Outlet as RouterOutlet, useLocation } from 'react-router-dom';
import NavigationTabs, {
  Tab,
  TabsPageLayout,
} from 'components/admin/NavigationTabs';
import { isTopBarNavActive } from 'utils/helperUtils';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { usePermission } from 'utils/permissions';

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
  const manualEmailingEnabled = useFeatureFlag({ name: 'manual_emailing' });
  const automatedEmailingEnabled = useFeatureFlag({
    name: 'automated_emailing_control',
  });
  const textingEnabled = useFeatureFlag({ name: 'texting' });

  useEffect(() => {
    if (pathname.match(/\/admin\/messaging$/)) {
      return;
    }

    const redirect = (url: string) => {
      clHistory.replace({
        pathname: url,
        search: window.location.search,
      });
    };

    if (canManageManualCampaigns && manualEmailingEnabled) {
      return redirect('/admin/messaging/emails/custom');
    }
    if (canManageAutomatedCampaigns && automatedEmailingEnabled) {
      return redirect('/admin/messaging/emails/automated');
    }
    if (textingEnabled) {
      return redirect('/admin/messaging/texting');
    }
  }, [
    pathname,
    canManageManualCampaigns,
    manualEmailingEnabled,
    canManageAutomatedCampaigns,
    automatedEmailingEnabled,
    textingEnabled,
  ]);

  if (!canManageAutomatedCampaigns || !canManageManualCampaigns) {
    return null;
  }

  const getTabs = () => {
    const tabs: {
      name: string;
      label: string;
      url: string;
      statusLabel?: string;
    }[] = [];

    if (canManageManualCampaigns && manualEmailingEnabled) {
      tabs.push({
        name: 'manual-emails',
        label: formatMessage(messages.customEmails),
        url: '/admin/messaging/emails/custom',
      });
    }
    if (canManageAutomatedCampaigns && automatedEmailingEnabled) {
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
        {tabs.map(({ url, label, name }) => (
          <Tab
            label={label}
            url={url}
            key={url}
            active={isTopBarNavActive('/admin/messaging', pathname, url)}
            statusLabel={
              name === 'texting' ? (
                <Box display="inline" ml="12px">
                  <StatusLabel
                    text={'Beta'}
                    backgroundColor={colors.background}
                    variant="outlined"
                  />
                </Box>
              ) : null
            }
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

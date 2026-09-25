import React, { ReactNode } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { ITab } from 'typings';

import NavigationTabs, {
  Tab,
  TabsPageLayout,
} from 'components/admin/NavigationTabs';
import HelmetIntl from 'components/HelmetIntl';
import NewLabel from 'components/UI/NewLabel';

import { useIntl } from 'utils/cl-intl';
import { isTopBarNavActive } from 'utils/helperUtils';
import { Outlet as RouterOutlet, useLocation } from 'utils/router';

import messages from './messages';
import { useSmsAvailability } from './Sms/smsAvailability';

const MessagingDashboard = () => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  const smsAvailability = useSmsAvailability();

  const tabs: (ITab & { disabledTooltipText?: string; badge?: ReactNode })[] = [
    {
      name: 'manual-emails',
      label: formatMessage(messages.customEmails),
      url: '/admin/messaging/emails/custom',
      className: 'intercom-messaging-custom-emails',
    },
    {
      name: 'automated-emails',
      label: formatMessage(messages.tabAutomatedEmails),
      url: '/admin/messaging/emails/automated',
      className: 'intercom-messaging-automated-emails',
    },
    ...(smsAvailability !== 'hidden'
      ? [
          {
            name: 'sms',
            label: formatMessage(messages.tabSms),
            url: '/admin/messaging/sms',
            className: 'intercom-messaging-sms',
            badge: (
              <Box
                as="span"
                display="inline-flex"
                ml="8px"
                // Nudged up to line up with the tab label's text.
                style={{
                  verticalAlign: 'middle',
                  position: 'relative',
                  top: '-2px',
                }}
              >
                <NewLabel expiryDate={new Date('2026-12-31')} />
              </Box>
            ),
            disabledTooltipText:
              smsAvailability === 'upsell'
                ? formatMessage(messages.smsUpsellTooltip)
                : undefined,
          },
        ]
      : []),
  ];

  return (
    <>
      <HelmetIntl
        title={messages.helmetTitle}
        description={messages.helmetDescription}
      />
      <NavigationTabs>
        {tabs.map(({ url, label, className, disabledTooltipText, badge }) => (
          <Tab
            label={label}
            url={url}
            key={url}
            active={isTopBarNavActive('/admin/messaging', pathname, url)}
            className={className}
            disabledTooltipText={disabledTooltipText}
            badge={badge}
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

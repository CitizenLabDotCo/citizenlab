import React, { useState } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { Outlet as RouterOutlet, useLocation } from 'react-router-dom';
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
import { defaultAdminCardPadding } from 'utils/styleConstants';

import messages from './messages';

const SettingsPage = () => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();

  const [tabs, setTabs] = useState<ITab[]>([
    {
      name: 'general',
      label: formatMessage(messages.tabSettings),
      url: '/admin/settings/general',
    },
    {
      name: 'branding',
      label: formatMessage(messages.tabBranding),
      url: '/admin/settings/branding',
    },
    {
      name: 'registration',
      label: formatMessage(messages.tabRegistration),
      url: '/admin/settings/registration',
    },
    {
      label: formatMessage(messages.tabTopics),
      name: 'topics',
      url: '/admin/settings/topics',
    },
    {
      name: 'areas',
      label: formatMessage(messages.tabAreas),
      url: '/admin/settings/areas',
    },
    {
      name: 'statuses',
      label: formatMessage(messages.tabInputStatuses),
      url: '/admin/settings/statuses',
    },
    {
      name: 'policies',
      label: formatMessage(messages.tabPolicies),
      url: '/admin/settings/policies',
    },
  ]);

  const handleData = (insertTabOptions: InsertConfigurationOptions<ITab>) => {
    setTabs(insertConfiguration(insertTabOptions)(tabs));
  };

  return (
    <>
      <Outlet id="app.containers.Admin.settings.tabs" onData={handleData} />
      <NavigationTabs>
        {tabs.map(({ url, label }) => (
          <Tab
            label={label}
            url={url}
            key={url}
            active={isTopBarNavActive('/admin/settings', pathname, url)}
          />
        ))}
      </NavigationTabs>

      <TabsPageLayout>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        <Box
          id="e2e-settings-container"
          background={colors.white}
          p={`${defaultAdminCardPadding}px`}
        >
          <RouterOutlet />
        </Box>
      </TabsPageLayout>
    </>
  );
};

export default SettingsPage;

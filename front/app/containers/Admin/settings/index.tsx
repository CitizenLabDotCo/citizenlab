import React, { useState } from 'react';

// router
import { Outlet as RouterOutlet, useLocation } from 'react-router-dom';

// components
import { Box } from '@citizenlab/cl2-component-library';
import HelmetIntl from 'components/HelmetIntl';
import NavigationTabs, {
  Tab,
  TabsPageLayout,
} from 'components/admin/NavigationTabs';
import Link from 'utils/cl-router/Link';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

import { InsertConfigurationOptions, ITab } from 'typings';
import { insertConfiguration } from 'utils/moduleUtils';
import Outlet from 'components/Outlet';
import { matchPathToUrl } from 'utils/helperUtils';
import { colors } from 'utils/styleUtils';

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
          <Tab key={url} active={matchPathToUrl(url).test(pathname)}>
            <Link to={url}>{label}</Link>
          </Tab>
        ))}
      </NavigationTabs>

      <TabsPageLayout>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        <Box id="e2e-settings-container" background={colors.white} p="40px">
          <RouterOutlet />
        </Box>
      </TabsPageLayout>
    </>
  );
};

export default SettingsPage;

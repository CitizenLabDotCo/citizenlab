import React from 'react';

import { Outlet as RouterOutlet, useLocation } from 'react-router-dom';
import { ITab } from 'typings';

import NavigationTabs, {
  Tab,
  TabsPageLayout,
} from 'components/admin/NavigationTabs';
import HelmetIntl from 'components/HelmetIntl';

import { useIntl } from 'utils/cl-intl';
import { isTopBarNavActive } from 'utils/helperUtils';

import messages from './messages';

const InitiativesPage = () => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();

  const tabs: ITab[] = [
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
    {
      label: formatMessage(messages.permissions),
      name: 'permissions',
      url: '/admin/initiatives/permissions',
      feature: 'granular_permissions',
    },
  ];

  return (
    <>
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

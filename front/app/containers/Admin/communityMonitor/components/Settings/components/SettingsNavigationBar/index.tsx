import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Outlet as RouterOutlet, useLocation } from 'react-router-dom';

import { Tab } from 'components/admin/NavigationTabs';

import { useIntl } from 'utils/cl-intl';
import { isTopBarNavActive } from 'utils/helperUtils';

import { getSettingsTabs } from './utils';

const SettingsNavigationBar = () => {
  const location = useLocation();
  const { formatMessage } = useIntl();

  const tabs = getSettingsTabs(formatMessage);

  return (
    <Box>
      <Box display="flex" mb="30px">
        {tabs.map((tab) => {
          const isActive = isTopBarNavActive(
            '/admin/community-monitor/settings',
            location.pathname,
            tab.url
          );

          return (
            <Tab
              key={tab.url}
              label={tab.label}
              url={tab.url}
              active={isActive}
            />
          );
        })}
      </Box>
      <RouterOutlet />
    </Box>
  );
};

export default SettingsNavigationBar;

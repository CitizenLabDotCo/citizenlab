import React, { useMemo } from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import { useLocation } from 'react-router-dom';
import { ITab } from 'typings';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';

import NavigationTabs, { Tab } from 'components/admin/NavigationTabs';

import { useIntl } from 'utils/cl-intl';
import { isTopBarNavActive } from 'utils/helperUtils';

import messages from '../../messages';

const NavigationBar = () => {
  const isTabletOrSmaller = useBreakpoint('tablet');
  const { formatMessage } = useIntl();
  const location = useLocation();

  const { data: project } = useCommunityMonitorProject();
  const projectId = project?.data.id;

  const communityMonitorTabs: ITab[] = useMemo(
    () => [
      {
        label: formatMessage(messages.liveMonitor),
        url: '/admin/community-monitor/live-monitor',
        name: 'live-monitor',
      },
      {
        label: formatMessage(messages.participants),
        name: 'participants',
        url: `/admin/community-monitor/participants/projects/${projectId}`,
      },
      {
        label: formatMessage(messages.reports),
        url: '/admin/community-monitor/reports',
        name: 'reports',
      },
      {
        label: formatMessage(messages.settings),
        name: 'settings',
        url: '/admin/community-monitor/settings',
      },
    ],
    [projectId, formatMessage]
  );

  return (
    <Box
      ml={isTabletOrSmaller ? '60px' : '200px'}
      position="fixed"
      top="0"
      left="0"
      right="0"
    >
      <NavigationTabs>
        {communityMonitorTabs.map((tab) => {
          const active = isTopBarNavActive(
            '/admin/community-monitor',
            location.pathname,
            tab.url
          );

          return (
            <Tab
              key={tab.url}
              label={tab.label}
              url={tab.url}
              active={active}
              className={active ? 'active' : ''}
            />
          );
        })}
      </NavigationTabs>
    </Box>
  );
};

export default NavigationBar;

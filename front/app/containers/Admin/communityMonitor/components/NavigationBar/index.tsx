import React from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import { useLocation } from 'react-router-dom';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';

import NavigationTabs, { Tab } from 'components/admin/NavigationTabs';

import { useIntl } from 'utils/cl-intl';
import { isTopBarNavActive } from 'utils/helperUtils';

import { getCommunityMonitorTabs } from './utils';

const NavigationBar = () => {
  const location = useLocation();
  const { formatMessage } = useIntl();
  const isTabletOrSmaller = useBreakpoint('tablet');

  const { data: project } = useCommunityMonitorProject();
  const projectId = project?.data.id;

  const tabs = getCommunityMonitorTabs(formatMessage, projectId);

  return (
    <Box
      ml={isTabletOrSmaller ? '60px' : '200px'}
      position="fixed"
      top="0"
      left="0"
      right="0"
      zIndex="1"
    >
      <NavigationTabs>
        {tabs.map((tab) => {
          const isActive = isTopBarNavActive(
            '/admin/community-monitor',
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
      </NavigationTabs>
    </Box>
  );
};

export default NavigationBar;

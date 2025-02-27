import React, { useEffect, useState } from 'react';

import {
  Box,
  Button,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { useLocation } from 'react-router-dom';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';

import { useIntl } from 'utils/cl-intl';

import { CommunityMonitorTab, getTabLabel, navigateToTab, TABS } from './utils';

const NavigationHeader = () => {
  const location = useLocation();
  const { formatMessage } = useIntl();
  const isTabletOrSmaller = useBreakpoint('tablet');

  // Get the Community Monitor project
  const { data: communityMonitorProject } = useCommunityMonitorProject();
  const projectId = communityMonitorProject?.data.id;

  const [activeTab, setActiveTab] = useState<CommunityMonitorTab | undefined>(
    undefined
  );

  // Set active tab and update the tab if the route changes
  useEffect(() => {
    const path = location.pathname;
    setActiveTab(TABS.find((tab) => path.includes(tab)));
  }, [location.pathname]);

  return (
    <Box
      position="fixed"
      gap="36px"
      right="0px"
      left={isTabletOrSmaller ? '80px' : '210px'}
      top="0px"
      minHeight="60px"
      bg={colors.white}
      display="flex"
      pl="30px"
    >
      {TABS.map((tab) => (
        <Button
          key={tab}
          p="0px"
          buttonStyle="text"
          onClick={() => navigateToTab(tab, projectId)}
          style={{
            borderBottom:
              activeTab === tab
                ? `3px solid ${colors.teal500}`
                : '3px solid white',
          }}
        >
          {formatMessage(getTabLabel(tab))}
        </Button>
      ))}
    </Box>
  );
};

export default NavigationHeader;

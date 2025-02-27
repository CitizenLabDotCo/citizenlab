import React, { useEffect } from 'react';

import {
  Box,
  Button,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { useLocation } from 'react-router-dom';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import clHistory from 'utils/cl-router/history';

type CommunityMonitorTab =
  | 'live-monitor'
  | 'participants'
  | 'reports'
  | 'settings';

const NavigationHeader = () => {
  const isTabletOrSmaller = useBreakpoint('tablet');

  const { data: appConfiguration } = useAppConfiguration();
  const communityMonitorProjectId =
    appConfiguration?.data.attributes.settings.community_monitor?.project_id;

  const [activeTab, setActiveTab] =
    React.useState<CommunityMonitorTab>('live-monitor');

  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('live-monitor')) {
      setActiveTab('live-monitor');
    } else if (path.includes('participants')) {
      setActiveTab('participants');
    } else if (path.includes('reports')) {
      setActiveTab('reports');
    } else if (path.includes('settings')) {
      setActiveTab('settings');
    }
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
    >
      <Button
        p="0px"
        ml="52px"
        buttonStyle="text"
        onClick={() => {
          clHistory.push('/admin/community-monitor/live-monitor');
        }}
        style={{
          borderBottom:
            activeTab === 'live-monitor'
              ? `3px solid ${colors.teal500}`
              : '3px solid white',
        }}
      >
        Live monitor
      </Button>
      <Button
        p="0px"
        buttonStyle="text"
        onClick={() => {
          clHistory.push(
            `/admin/community-monitor/participants/projects/${communityMonitorProjectId}`
          );
        }}
        style={{
          borderBottom:
            activeTab === 'participants'
              ? `3px solid ${colors.teal500}`
              : '3px solid white',
        }}
      >
        Participants
      </Button>
      <Button
        p="0px"
        buttonStyle="text"
        onClick={() => {
          clHistory.push('/admin/community-monitor/reports');
        }}
        style={{
          borderBottom:
            activeTab === 'reports'
              ? `3px solid ${colors.teal500}`
              : '3px solid white',
        }}
      >
        Reports
      </Button>
      <Button
        p="0px"
        buttonStyle="text"
        onClick={() => {
          clHistory.push('/admin/community-monitor/settings');
        }}
        style={{
          borderBottom:
            activeTab === 'settings'
              ? `3px solid ${colors.teal500}`
              : '3px solid white',
        }}
      >
        Settings
      </Button>
    </Box>
  );
};

export default NavigationHeader;

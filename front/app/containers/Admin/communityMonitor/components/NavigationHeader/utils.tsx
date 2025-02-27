import { RouteType } from 'routes';

import clHistory from 'utils/cl-router/history';

import messages from './messages';

export type CommunityMonitorTab =
  | 'live-monitor'
  | 'participants'
  | 'reports'
  | 'settings';

export const TABS: CommunityMonitorTab[] = [
  'live-monitor',
  'participants',
  'reports',
  'settings',
];

// Get the label for a community monitor tab
export const getTabLabel = (tab: CommunityMonitorTab) => {
  switch (tab) {
    case 'live-monitor':
      return messages.liveMonitor;
    case 'participants':
      return messages.participants;
    case 'reports':
      return messages.reports;
    case 'settings':
      return messages.settings;
  }
};

// Navigate to a selected tab
export const navigateToTab = (tab: CommunityMonitorTab, projectId?: string) => {
  const pathMap: Record<CommunityMonitorTab, RouteType> = {
    'live-monitor': '/admin/community-monitor/live-monitor',
    participants: `/admin/community-monitor/participants/projects/${projectId}`,
    reports: '/admin/community-monitor/reports',
    settings: '/admin/community-monitor/settings',
  };
  clHistory.push(pathMap[tab]);
};

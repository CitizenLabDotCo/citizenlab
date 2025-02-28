import { RouteType } from 'routes';
import { FormatMessage } from 'typings';

import messages from '../../messages';

export const getCommunityMonitorTabs = (
  formatMessage: FormatMessage,
  projectId?: string
) => {
  return [
    {
      label: formatMessage(messages.liveMonitor),
      url: '/admin/community-monitor/live-monitor' as RouteType,
      name: 'live-monitor',
    },
    {
      label: formatMessage(messages.participants),
      name: 'participants',
      url: `/admin/community-monitor/participants/projects/${projectId}` as RouteType,
    },
    {
      label: formatMessage(messages.reports),
      url: '/admin/community-monitor/reports' as RouteType,
      name: 'reports',
    },
    {
      label: formatMessage(messages.settings),
      name: 'settings',
      url: '/admin/community-monitor/settings' as RouteType,
    },
  ];
};

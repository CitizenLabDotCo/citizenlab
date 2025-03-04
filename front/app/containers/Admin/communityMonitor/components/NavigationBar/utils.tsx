import { FormatMessage, ITab } from 'typings';

import messages from '../../messages';

export const getCommunityMonitorTabs = (
  formatMessage: FormatMessage,
  projectId: string
): ITab[] => {
  return [
    {
      label: formatMessage(messages.liveMonitor),
      url: `/admin/community-monitor/live-monitor`,
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
  ];
};

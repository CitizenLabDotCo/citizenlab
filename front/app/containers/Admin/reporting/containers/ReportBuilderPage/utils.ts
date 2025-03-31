import { IUser } from 'api/users/types';

import { isAdmin } from 'utils/permissions/roles';

export const getDefaultTab = (user: IUser | undefined) => {
  let defaultTab = isAdmin(user) ? 'all-reports' : 'your-reports';

  const isCommunityMonitorReportTab = location.pathname.includes(
    'community-monitor/reports'
  );

  if (isCommunityMonitorReportTab) {
    defaultTab = 'community-monitor';
  }

  return defaultTab;
};

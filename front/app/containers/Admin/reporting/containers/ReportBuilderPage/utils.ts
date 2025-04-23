import { IUser } from 'api/users/types';

import { isAdmin } from 'utils/permissions/roles';

export const getDefaultTab = (user?: IUser): string => {
  if (location.pathname.includes('community-monitor/reports')) {
    return 'community-monitor';
  }

  return isAdmin(user) ? 'all-reports' : 'your-reports';
};

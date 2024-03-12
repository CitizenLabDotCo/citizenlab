import { IUser } from 'api/users/types';

import { definePermissionRule } from 'utils/permissions/permissions';

import { isAdmin, isProjectModerator } from '../roles';

definePermissionRule(
  'automatedCampaign',
  'manage',
  (_campaign: string, user: IUser) => {
    return isAdmin(user);
  }
);

definePermissionRule(
  'manualCampaign',
  'manage',
  (_campaign: string, user: IUser) => {
    return isAdmin(user) || isProjectModerator(user);
  }
);

// Create diff with master

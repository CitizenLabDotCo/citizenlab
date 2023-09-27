import { definePermissionRule } from 'utils/permissions/permissions';
import { isAdmin, isProjectModerator } from '../roles';
import { IUser } from 'api/users/types';

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

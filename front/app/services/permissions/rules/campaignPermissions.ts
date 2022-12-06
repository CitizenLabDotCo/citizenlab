import { definePermissionRule } from 'services/permissions/permissions';
import { IUser } from 'services/users';
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

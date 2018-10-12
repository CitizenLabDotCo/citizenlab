import { definePermissionRule } from 'services/permissions/permissions';
import { isAdmin, isProjectModerator } from '../roles';
import { IUser } from 'services/users';

definePermissionRule('automatedCampaigns', 'manage', (_campaign: string, user: IUser) => {
  return isAdmin(user);
});

definePermissionRule('manualCampaigns', 'manage', (_campaign: string, user: IUser) => {
  return isAdmin(user) || isProjectModerator(user);
});

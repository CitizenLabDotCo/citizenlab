import { definePermissionRule } from 'utils/permissions/permissions';

import { isAdmin } from '../roles';

definePermissionRule(
  'automatedCampaign',
  'manage',
  (_campaign: string, user) => {
    return user ? isAdmin(user) : false;
  }
);

definePermissionRule('manualCampaign', 'manage', (_campaign: string, user) => {
  return user ? isAdmin(user) : false;
});

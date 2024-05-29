import { definePermissionRule } from 'utils/permissions/permissions';

import { isAdmin } from '../roles';

definePermissionRule(
  'automatedCampaign',
  'manage',
  (_campaign: string, user) => {
    return isAdmin(user);
  }
);

definePermissionRule('manualCampaign', 'manage', (_campaign: string, user) => {
  return isAdmin(user);
});

import { Multiloc } from 'typings';

import { PermittedBy } from 'api/phase_permissions/types';

export type Changes = {
  permitted_by?: PermittedBy;
  group_ids?: string[];
  verification_expiry?: number | null;
  access_denied_explanation_multiloc?: Multiloc;
  everyone_tracking_enabled?: boolean;
};

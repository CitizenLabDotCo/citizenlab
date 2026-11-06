import { Multiloc } from 'typings';

import { IPhasePermissionAction, PermittedBy } from 'api/permissions/types';

export type UpdatePhasePermissionArguments = {
  phase_id: string;
  action: IPhasePermissionAction;
  permitted_by: PermittedBy;
  group_ids?: string[];
  require_name?: boolean;
  require_password?: boolean;
  require_confirmed_email?: boolean;
  confirmed_email_expiry?: number | null;
  require_verification?: boolean;
  verification_expiry?: number | null;
  require_confirmed_phone_number?: boolean;
  confirmed_phone_number_expiry?: number | null;
  access_denied_explanation_multiloc?: Multiloc | null;
};

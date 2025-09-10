import { Multiloc } from 'typings';

import { IPermissionData } from 'api/permissions/types';
import { PermittedBy } from 'api/phase_permissions/types';
import { Anonymity } from 'api/phases/types';

export type Changes = {
  permitted_by?: PermittedBy;
  group_ids?: string[];
  verification_expiry?: number | null;
  access_denied_explanation_multiloc?: Multiloc;
  everyone_tracking_enabled?: boolean;
};

type PhaseSettings = {
  anonymity?: Anonymity;
  user_fields_in_form?: boolean;
};

export type Props = {
  phaseId?: string;
  permissionData: IPermissionData;
  onChange: (changes: Changes) => Promise<void>;
  onReset: () => void;
  onChangePhaseSetting?: (settings: PhaseSettings) => void;
};

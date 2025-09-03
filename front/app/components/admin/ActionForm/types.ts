import { Multiloc } from 'typings';

import { IPermissionData } from 'api/permissions/types';
import { PermittedBy } from 'api/phase_permissions/types';

export type Changes = {
  permitted_by?: PermittedBy;
  group_ids?: string[];
  verification_expiry?: number | null;
  access_denied_explanation_multiloc?: Multiloc;
  everyone_tracking_enabled?: boolean;
};

type PhaseSettings = {
  allow_anonymous_participation?: boolean;
  // TODO: the last page survey thing
};

export type Props = {
  phaseId?: string;
  permissionData: IPermissionData;
  onChange: (changes: Changes) => Promise<void>;
  onReset: () => void;
  onChangePhaseSetting?: (settings: PhaseSettings) => void;
};

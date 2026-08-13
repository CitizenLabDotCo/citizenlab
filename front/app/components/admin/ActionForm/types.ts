// Data model for the "Participation requirements" panel.
//
// The panel is a *stateless*, controlled view: it receives an
// `IPermissionData` and emits granular `Changes` through `onChange`; the
// parent owns the state and persists it. The demographic questions are not
// passed in — they are read straight from `usePermissionsPhaseCustomFields`
// (and mutated through its sibling hooks).

import { ReactNode } from 'react';

import { Multiloc } from 'typings';

import {
  IPermissionData,
  PermittedBy,
  UserDataCollection,
} from 'api/permissions/types';

// The set of edits the panel can emit. A superset of `ActionForm`'s `Changes`,
// extended with the composable `require_*` / `*_expiry` fields this design edits
// directly (the old form bundled these into the `permitted_by` enum instead).
export type Changes = {
  permitted_by?: PermittedBy;
  group_ids?: string[];
  require_confirmed_email?: boolean;
  confirmed_email_expiry?: number | null;
  require_confirmed_phone_number?: boolean;
  confirmed_phone_number_expiry?: number | null;
  require_verification?: boolean;
  verification_expiry?: number | null;
  require_name?: boolean;
  require_password?: boolean;
  access_denied_explanation_multiloc?: Multiloc;
  everyone_tracking_enabled?: boolean;
  user_data_collection?: UserDataCollection;
  user_fields_in_form?: boolean;
};

export type Props = {
  phaseId: string;
  permissionData: IPermissionData;
  // Heading shown in the panel's collapse header (e.g. the action subtitle).
  title: ReactNode;
  // Whether the panel starts expanded. Defaults to closed.
  defaultOpen?: boolean;
  onChange: (changes: Changes) => Promise<void>;
  onReset: () => void;
  // Called when the admin opts the action out of the platform defaults, and
  // when they put it back. Omitted where the distinction doesn't apply (the
  // panel then behaves as it always has).
  onOverride?: () => Promise<void>;
  onRevertToDefaults?: () => Promise<void>;
};

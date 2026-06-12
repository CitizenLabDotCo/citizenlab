// Data model for the "Participation requirements" panel.
//
// The panel is a *stateless*, controlled view: it receives an
// `IPhasePermissionData` and emits granular `Changes` through `onChange`; the
// parent owns the state and persists it. The demographic questions are not
// passed in — they are read straight from `usePermissionsPhaseCustomFields`
// (and mutated through its sibling hooks).

import { ReactNode } from 'react';

import { Multiloc } from 'typings';

import {
  IPhasePermissionData,
  PermittedBy,
  UserDataCollection,
} from 'api/phase_permissions/types';

export type { IPhasePermissionData, PermittedBy, UserDataCollection };

// The set of edits the panel can emit. A superset of `ActionForm`'s `Changes`,
// extended with the composable `require_*` / `*_expiry` fields this design edits
// directly (the old form bundled these into the `permitted_by` enum instead).
export type Changes = {
  permitted_by?: PermittedBy;
  group_ids?: string[];
  require_confirmed_email?: boolean;
  confirmed_email_expiry?: number | null;
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
  phaseId?: string;
  permissionData: IPhasePermissionData;
  // Heading shown in the panel's collapse header (e.g. the action subtitle).
  title: ReactNode;
  // Whether the panel starts expanded. Defaults to closed.
  defaultOpen?: boolean;
  onChange: (changes: Changes) => Promise<void>;
  onReset: () => void;
};

// The authentication methods still offered after dropping "confirmed phone":
// each one maps onto a `require_*` boolean + `*_expiry` pair on the permission.
export type AuthMethodKey = 'email' | 'verification';

// Maps an auth method onto the permission attributes (and matching change keys)
// that back it. Keeping this in one place lets the UI stay generic over methods.
export const METHOD_FIELDS = {
  email: {
    enabled: 'require_confirmed_email',
    expiry: 'confirmed_email_expiry',
  },
  verification: {
    enabled: 'require_verification',
    expiry: 'verification_expiry',
  },
} as const;

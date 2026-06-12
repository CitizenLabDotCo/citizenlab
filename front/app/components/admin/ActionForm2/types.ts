// Design prototype – data model for the "Participation requirements" panel.
//
// This prototype is wired directly to the real API types: the panel edits an
// `IPhasePermissionData` (the phase-permission resource) plus the list of
// `IPermissionsPhaseCustomFieldData` that represents the demographic questions
// attached to that permission. There is intentionally no bespoke "AccessConfig"
// model anymore — the shapes below only describe things that are *not* part of
// the permission resource (platform settings, the auth-method enumeration, and
// the mock global demographic fields the admin can pick from).

import { IPermissionsPhaseCustomFieldData } from 'api/permissions_phase_custom_fields/types';
import { IPhasePermissionData, PermittedBy } from 'api/phase_permissions/types';

export type { IPhasePermissionData, PermittedBy };
export type { IPermissionsPhaseCustomFieldData };

// The authentication methods still offered after dropping "confirmed phone":
// each one maps onto a `require_*` boolean + `*_expiry` pair on the permission.
export type AuthMethodKey = 'email' | 'verification';

// Maps an auth method onto the permission attributes that back it. Keeping this
// in one place lets the UI stay generic over "methods".
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

// Platform-level settings that constrain what is *available* in the panel.
// In the real app these come from the AppConfiguration settings schema
// (e.g. `password_login`) and from the configured verification method.
export interface PlatformSettings {
  passwordLoginEnabled: boolean;
  verificationAllowed: boolean;
  verificationMethodName: string;
}

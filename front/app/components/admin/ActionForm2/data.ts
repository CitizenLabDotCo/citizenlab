// Design prototype – mock data + defaults so the panel is self-contained and
// runnable without a backend. In the real component these would come from
// `useGroups`, the global user-custom-fields API and the AppConfiguration; the
// permission + custom fields themselves would come from `usePhasePermissions`
// and `usePermissionsPhaseCustomFields`.

import { SupportedLocale } from 'typings';

import {
  AuthMethodKey,
  IPermissionsPhaseCustomFieldData,
  IPhasePermissionData,
  PlatformSettings,
} from './types';

// Locales configured on the platform (would come from AppConfiguration).
export const MOCK_LOCALES: SupportedLocale[] = ['en', 'fr-FR', 'nl-NL'];

// Default shown to users who don't meet the requirements.
export const DEFAULT_ACCESS_DENIED_MESSAGE =
  'You do not meet the requirements to participate in this process.';

// Fields an identity-verification method hands back. Some are "locked":
// the user cannot edit them because they come straight from the register.
export interface VerificationReturnedField {
  label: string;
  locked: boolean;
}

export const VERIFICATION_RETURNED_FIELDS: VerificationReturnedField[] = [
  { label: 'First name', locked: true },
  { label: 'Last name', locked: true },
  { label: 'Year of birth', locked: true },
  { label: 'Gender', locked: false },
];

// ---- "Stadt Wien Konto" variant: a single, fixed SSO sign-in method ----

export const STADT_WIEN_KONTO_NAME = 'Stadt Wien Konto';

export const STADT_WIEN_KONTO_RETURNED_FIELDS: VerificationReturnedField[] = [
  { label: 'First name', locked: true },
  { label: 'Last name', locked: true },
  { label: 'Email', locked: true },
  { label: 'Date of birth', locked: true },
  { label: 'District', locked: false },
];

export interface MockGroup {
  id: string;
  title: string;
  smart: boolean; // "smart" groups are rule-based; manual groups are not
}

export const MOCK_GROUPS: MockGroup[] = [
  { id: 'residents', title: 'Verified residents', smart: true },
  { id: 'over-18', title: 'Adults (18+)', smart: true },
  { id: 'newsletter', title: 'Newsletter subscribers', smart: false },
  { id: 'district-north', title: 'District North', smart: true },
  { id: 'staff', title: 'City staff', smart: false },
];

export interface DemographicField {
  id: string;
  title: string;
}

// Globally configured demographic fields, shared across all actions. These are
// the pool the admin picks from; each pick becomes a permission custom field.
export const DEMOGRAPHIC_FIELDS: DemographicField[] = [
  { id: 'gender', title: 'Gender' },
  { id: 'birthyear', title: 'Year of birth' },
  { id: 'domicile', title: 'Place of residence' },
  { id: 'education', title: 'Education level' },
  { id: 'languages', title: 'Languages spoken' },
];

export const AUTH_METHOD_LABELS: Record<AuthMethodKey, string> = {
  email: 'Confirmed email',
  verification: 'Identity verification',
};

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  passwordLoginEnabled: true,
  verificationAllowed: true,
  verificationMethodName: 'FranceConnect',
};

// A permission custom field (a demographic question attached to the permission).
// Built locally for the prototype; in the real app the API returns these.
export const buildCustomField = (
  customFieldId: string,
  ordering: number,
  required = true
): IPermissionsPhaseCustomFieldData => ({
  id: customFieldId,
  type: 'permissions_custom_field',
  attributes: {
    created_at: '',
    lock: null,
    ordering,
    persisted: false,
    required,
    updated_at: '',
  },
  relationships: {
    permission: { data: { id: 'default-permission', type: 'permission' } },
    custom_field: { data: { id: customFieldId, type: 'custom_field' } },
  },
});

// A sensible default permission: require sign-in via confirmed email.
export const DEFAULT_PERMISSION: IPhasePermissionData = {
  id: 'default-permission',
  type: 'permission',
  attributes: {
    access_denied_explanation_multiloc: {},
    action: 'posting_idea',
    confirmed_email_expiry: null,
    created_at: '',
    everyone_tracking_enabled: false,
    global_custom_fields: false,
    permitted_by: 'users',
    permitted_by_everyone_allowed: true,
    require_confirmed_email: true,
    require_name: false,
    require_password: false,
    require_verification: false,
    updated_at: '',
    user_data_collection: 'all_data',
    user_fields_in_form_descriptor: {
      value: false,
      locked: false,
      explanation: null,
    },
    verification_enabled: true,
    verification_expiry: null,
  },
  relationships: {
    permission_scope: { data: { id: 'default-phase', type: 'phase' } },
    groups: { data: [] },
  },
};

export const DEFAULT_CUSTOM_FIELDS: IPermissionsPhaseCustomFieldData[] = [];

// The Stadt Wien Konto variant has a single fixed SSO sign-in method, so none of
// the per-method `require_*` toggles are set — sign-in is implied by requiring
// an account (`permitted_by: 'users'`).
export const DEFAULT_PERMISSION_WIEN_KONTO: IPhasePermissionData = {
  ...DEFAULT_PERMISSION,
  attributes: {
    ...DEFAULT_PERMISSION.attributes,
    require_confirmed_email: false,
    require_verification: false,
  },
};

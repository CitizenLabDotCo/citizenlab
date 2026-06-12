// The "rules engine". All the cross-setting dependencies live here, in one
// place, so the UI components stay dumb. Every helper reads from the
// `IPhasePermissionData` shape (plus the list of permission custom fields that
// holds the demographics). The panel is stateless, so nothing here mutates:
// writes are expressed as `Changes` for `onChange`.

import { IdMethod } from 'api/id_methods/types';
import { IPermissionsPhaseCustomFieldData } from 'api/permissions_phase_custom_fields/types';
import { UserDataCollection } from 'api/phase_permissions/types';

import { AUTH_METHOD_LABELS } from './data';
import {
  AuthMethodKey,
  Changes,
  IPhasePermissionData,
  METHOD_FIELDS,
} from './types';

/** The enabled flag + expiry (in days, `null` = "once, ever") for a method. */
export const getMethod = (
  permission: IPhasePermissionData,
  key: AuthMethodKey
): { enabled: boolean; expiry: number | null } => {
  const fields = METHOD_FIELDS[key];
  return {
    enabled: permission.attributes[fields.enabled],
    expiry: permission.attributes[fields.expiry],
  };
};

/** The change to emit when a method's toggle / recency is edited. */
export const methodChange = (
  key: AuthMethodKey,
  { enabled, expiry }: { enabled: boolean; expiry: number | null }
): Changes => {
  const fields = METHOD_FIELDS[key];
  return { [fields.enabled]: enabled, [fields.expiry]: expiry } as Changes;
};

/** Group ids the action is limited to (OR semantics). */
export const getGroupIds = (permission: IPhasePermissionData): string[] =>
  permission.relationships.groups.data.map((g) => g.id);

/** Does participation require an account? Driven by `permitted_by`. */
export const requiresAccount = (permission: IPhasePermissionData): boolean =>
  permission.attributes.permitted_by === 'users';

/** With an account required, has the user actually picked a method yet? */
export const hasEnabledMethod = (permission: IPhasePermissionData): boolean =>
  permission.attributes.require_confirmed_email ||
  permission.attributes.require_verification;

/** Only "everyone" forces demographics onto a form page; others allow either. */
export const placementLocked = (permission: IPhasePermissionData): boolean =>
  permission.attributes.permitted_by === 'everyone';

// ---- Human-readable summary, used both for the collapsed header and a11y ----

export interface SummaryChip {
  key: string;
  label: string;
  icon: 'user-circle' | 'email' | 'comment' | 'shield-checkered' | 'group' | 'lock' | 'user-data';
  tone: 'access' | 'data' | 'open';
}

// Demographic questions can be collected in every mode, so this chip is shared.
const demographicsChip = (
  customFields: IPermissionsPhaseCustomFieldData[]
): SummaryChip[] => {
  if (customFields.length === 0) return [];
  const n = customFields.length;
  return [
    {
      key: 'demographics',
      label: `${n} question${n > 1 ? 's' : ''}`,
      icon: 'user-data',
      tone: 'data',
    },
  ];
};

export const buildSummary = (
  permission: IPhasePermissionData,
  customFields: IPermissionsPhaseCustomFieldData[]
): SummaryChip[] => {
  const { attributes } = permission;

  if (attributes.permitted_by === 'admins_moderators') {
    return [
      {
        key: 'admins',
        label: 'Admins & managers only',
        icon: 'shield-checkered',
        tone: 'access',
      },
    ];
  }

  if (!requiresAccount(permission)) {
    return [
      { key: 'open', label: 'Anyone can participate', icon: 'user-circle', tone: 'open' },
      ...demographicsChip(customFields),
    ];
  }

  const chips: SummaryChip[] = [];
  const methodIcon: Record<AuthMethodKey, SummaryChip['icon']> = {
    email: 'email',
    verification: 'shield-checkered',
  };
  (Object.keys(METHOD_FIELDS) as AuthMethodKey[]).forEach((key) => {
    if (getMethod(permission, key).enabled) {
      chips.push({
        key,
        label: AUTH_METHOD_LABELS[key],
        icon: methodIcon[key],
        tone: 'access',
      });
    }
  });

  // Account required but no method chosen yet.
  if (!hasEnabledMethod(permission)) {
    chips.push({
      key: 'account',
      label: 'Sign-in required',
      icon: 'user-circle',
      tone: 'access',
    });
  }

  const groupIds = getGroupIds(permission);
  if (groupIds.length > 0) {
    chips.push({
      key: 'groups',
      label: `${groupIds.length} group${groupIds.length > 1 ? 's' : ''}`,
      icon: 'group',
      tone: 'access',
    });
  }

  if (attributes.require_name) {
    chips.push({ key: 'name', label: 'Name', icon: 'user-circle', tone: 'data' });
  }
  if (attributes.require_password) {
    chips.push({ key: 'password', label: 'Password', icon: 'lock', tone: 'data' });
  }

  chips.push(...demographicsChip(customFields));

  if (attributes.user_data_collection !== 'all_data') {
    chips.push({
      key: 'anonymity',
      label:
        attributes.user_data_collection === 'anonymous'
          ? 'Anonymous'
          : 'PII excluded',
      icon: 'user-circle',
      tone: 'data',
    });
  }

  return chips;
};

// Summary for the SSO variant: the sign-in method is fixed, so the per-method
// chips are replaced by a single SSO chip.
export const buildSummarySSO = (
  permission: IPhasePermissionData,
  customFields: IPermissionsPhaseCustomFieldData[],
  signInLabel: string
): SummaryChip[] => {
  const { attributes } = permission;

  if (attributes.permitted_by === 'admins_moderators') {
    return [
      {
        key: 'admins',
        label: 'Admins & managers only',
        icon: 'shield-checkered',
        tone: 'access',
      },
    ];
  }

  if (attributes.permitted_by === 'everyone') {
    return [
      { key: 'open', label: 'Anyone can participate', icon: 'user-circle', tone: 'open' },
      ...demographicsChip(customFields),
    ];
  }

  const chips: SummaryChip[] = [
    { key: 'signin', label: signInLabel, icon: 'shield-checkered', tone: 'access' },
  ];
  const groupIds = getGroupIds(permission);
  if (groupIds.length > 0) {
    chips.push({
      key: 'groups',
      label: `${groupIds.length} group${groupIds.length > 1 ? 's' : ''}`,
      icon: 'group',
      tone: 'access',
    });
  }
  if (attributes.require_name) {
    chips.push({ key: 'name', label: 'Name', icon: 'user-circle', tone: 'data' });
  }
  chips.push(...demographicsChip(customFields));
  if (attributes.user_data_collection !== 'all_data') {
    chips.push({
      key: 'anonymity',
      label:
        attributes.user_data_collection === 'anonymous'
          ? 'Anonymous'
          : 'PII excluded',
      icon: 'user-circle',
      tone: 'data',
    });
  }
  return chips;
};

/** The id of the global demographic field a permission custom field points at. */
export const customFieldId = (field: IPermissionsPhaseCustomFieldData): string =>
  field.relationships.custom_field.data.id;

/** Readable name of the fixed SSO sign-in method, with a generic fallback. */
export const ssoMethodName = (authenticationMethod?: IdMethod): string =>
  authenticationMethod?.data.attributes.method_metadata?.name ?? 'SSO account';

// ---- One-line summaries shown on the collapsed setting rows ----

export const groupsSummary = (permission: IPhasePermissionData): string => {
  const n = getGroupIds(permission).length;
  if (n === 0) return 'Everyone who signs in';
  return `${n} group${n > 1 ? 's' : ''}`;
};

export const piiSummary = (permission: IPhasePermissionData): string => {
  const parts: string[] = [];
  if (permission.attributes.require_name) parts.push('Name');
  if (permission.attributes.require_password) parts.push('Password');
  return parts.length ? parts.join(' · ') : 'Nothing extra';
};

export const demographicsSummary = (
  customFields: IPermissionsPhaseCustomFieldData[]
): string => {
  const n = customFields.length;
  return n === 0 ? 'None' : `${n} question${n > 1 ? 's' : ''}`;
};

export const DATA_COLLECTION_SUMMARY: Record<UserDataCollection, string> = {
  all_data: 'Linked to profile',
  demographics_only: 'PII excluded from results',
  anonymous: 'Fully anonymous',
};

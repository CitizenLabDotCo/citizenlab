// Design prototype – the "rules engine". All the cross-setting dependencies the
// brief calls out live here, in one place, so the UI components stay dumb. Every
// helper reads from / writes to the real `IPhasePermissionData` shape (plus the
// separate list of permission custom fields that holds the demographics).

import { UserDataCollection } from 'api/phase_permissions/types';

import { AUTH_METHOD_LABELS, DEMOGRAPHIC_FIELDS } from './data';
import {
  AuthMethodKey,
  IPermissionsPhaseCustomFieldData,
  IPhasePermissionData,
  METHOD_FIELDS,
  PlatformSettings,
} from './types';

type Attributes = IPhasePermissionData['attributes'];

/** Immutably patch a permission's attributes. */
const updateAttributes = (
  permission: IPhasePermissionData,
  attrs: Partial<Attributes>
): IPhasePermissionData => ({
  ...permission,
  attributes: { ...permission.attributes, ...attrs },
});

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

export const setMethod = (
  permission: IPhasePermissionData,
  key: AuthMethodKey,
  { enabled, expiry }: { enabled: boolean; expiry: number | null }
): IPhasePermissionData => {
  const fields = METHOD_FIELDS[key];
  return updateAttributes(permission, {
    [fields.enabled]: enabled,
    [fields.expiry]: expiry,
  } as Partial<Attributes>);
};

/** Group ids the action is limited to (OR semantics). */
export const getGroupIds = (permission: IPhasePermissionData): string[] =>
  permission.relationships.groups.data.map((g) => g.id);

export const setGroupIds = (
  permission: IPhasePermissionData,
  ids: string[]
): IPhasePermissionData => ({
  ...permission,
  relationships: {
    ...permission.relationships,
    groups: { data: ids.map((id) => ({ id, type: 'group' })) },
  },
});

/** Is a given authentication method offered by the platform at all? */
export const isMethodAvailable = (
  method: AuthMethodKey,
  settings: PlatformSettings
): boolean => {
  switch (method) {
    case 'email':
      // Confirmed email needs password login (email/OTP infra) enabled.
      return settings.passwordLoginEnabled;
    case 'verification':
      return settings.verificationAllowed;
  }
};

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

/**
 * Force a permission into a valid state given the current platform settings.
 * This encodes the "tricky parts" from the brief:
 *  - methods the platform doesn't offer are switched off;
 *  - access controls (methods, groups, PII, anonymity) need an account, so
 *    they clear when the action is open to everyone or limited to admins;
 *  - in the open ("everyone") mode demographics survive, but can only be asked
 *    on a form page, not in registration;
 *  - a password only makes sense alongside the confirmed-email method.
 */
export const normalize = (
  permission: IPhasePermissionData,
  settings: PlatformSettings
): IPhasePermissionData => {
  const { permitted_by } = permission.attributes;
  const hasAccount = permitted_by === 'users';

  let next = permission;

  // No account => no methods; otherwise drop methods the platform can't offer.
  (Object.keys(METHOD_FIELDS) as AuthMethodKey[]).forEach((key) => {
    if (!hasAccount || !isMethodAvailable(key, settings)) {
      next = setMethod(next, key, { enabled: false, expiry: null });
    }
  });

  const emailEnabled = next.attributes.require_confirmed_email;

  next = updateAttributes(next, {
    // Account-only settings: nobody to restrict, store PII against, or
    // anonymise without an account.
    require_name: hasAccount ? next.attributes.require_name : false,
    // Password requires the confirmed-email account specifically.
    require_password:
      hasAccount && emailEnabled ? next.attributes.require_password : false,
    user_data_collection: hasAccount
      ? next.attributes.user_data_collection
      : 'all_data',
    // In the open mode demographics can only be asked on a form page, and that
    // choice is locked; otherwise the radio is editable.
    user_fields_in_form_descriptor:
      permitted_by === 'everyone'
        ? { value: true, locked: true, explanation: null }
        : { ...next.attributes.user_fields_in_form_descriptor, locked: false },
  });

  // Groups need an account to restrict.
  if (!hasAccount) {
    next = setGroupIds(next, []);
  }

  return next;
};

/** Admins-only is a closed gate: demographic questions don't apply there. */
export const normalizeCustomFields = (
  permission: IPhasePermissionData,
  customFields: IPermissionsPhaseCustomFieldData[]
): IPermissionsPhaseCustomFieldData[] =>
  permission.attributes.permitted_by === 'admins_moderators'
    ? []
    : customFields;

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

// Summary for the Stadt Wien Konto variant: the sign-in method is fixed, so the
// per-method chips are replaced by a single "Stadt Wien Konto" chip.
export const buildSummaryWienKonto = (
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

export const demographicTitle = (fieldId: string): string =>
  DEMOGRAPHIC_FIELDS.find((f) => f.id === fieldId)?.title ?? fieldId;

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

// The "rules engine". All the cross-setting dependencies live here, in one
// place, so the UI components stay dumb. Every helper reads from the
// `IPhasePermissionData` shape (plus the list of permission custom fields that
// holds the demographics). The panel is stateless, so nothing here mutates:
// writes are expressed as `Changes` for `onChange`.
import { FormatMessage } from 'typings';

import { IdMethod } from 'api/id_methods/types';
import { IPermissionsPhaseCustomFieldData } from 'api/permissions_phase_custom_fields/types';
import {
  IPhasePermissionData,
  UserDataCollection,
} from 'api/phase_permissions/types';

import { MessageDescriptor } from 'utils/cl-intl';

import { AUTH_METHOD_LABELS } from './AccessSections/constants';
import messages from './messages';
import { AuthMethodKey, Changes, METHOD_FIELDS } from './types';

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

export interface SummaryChip {
  key: string;
  label: string;
  icon: 'user-circle' | 'email' | 'comment' | 'shield-checkered' | 'group' | 'lock' | 'user-data';
  tone: 'access' | 'data' | 'open';
}

// Demographic questions can be collected in every mode, so this chip is shared.
const demographicsChip = (
  customFields: IPermissionsPhaseCustomFieldData[],
  formatMessage: FormatMessage
): SummaryChip[] => {
  if (customFields.length === 0) return [];
  const n = customFields.length;
  return [
    {
      key: 'demographics',
      label: formatMessage(messages.nQuestions, { nQuestions: n }),
      icon: 'user-data',
      tone: 'data',
    },
  ];
};

export const buildSummary = (
  permission: IPhasePermissionData,
  customFields: IPermissionsPhaseCustomFieldData[],
  formatMessage: FormatMessage
): SummaryChip[] => {
  const { attributes } = permission;

  if (attributes.permitted_by === 'admins_moderators') {
    return [
      {
        key: 'admins',
        label: formatMessage(messages.adminsManagersOnly),
        icon: 'shield-checkered',
        tone: 'access',
      },
    ];
  }

  if (!requiresAccount(permission)) {
    return [
      {
        key: 'open',
        label: formatMessage(messages.anyoneCanParticipate),
        icon: 'user-circle',
        tone: 'open'
      },
      ...demographicsChip(customFields, formatMessage),
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
        label: formatMessage(AUTH_METHOD_LABELS[key]),
        icon: methodIcon[key],
        tone: 'access',
      });
    }
  });

  const groupIds = getGroupIds(permission);
  if (groupIds.length > 0) {
    chips.push({
      key: 'groups',
      label: formatMessage(messages.nGroups, { nGroups: groupIds.length }),
      icon: 'group',
      tone: 'access',
    });
  }

  if (attributes.require_name) {
    chips.push({
      key: 'name',
      label: formatMessage(messages.name),
      icon: 'user-circle',
      tone: 'data'
    });
  }
  if (attributes.require_password) {
    chips.push({
      key: 'password',
      label: formatMessage(messages.password),
      icon: 'lock',
      tone: 'data'
    });
  }

  chips.push(...demographicsChip(customFields, formatMessage));

  if (attributes.user_data_collection !== 'all_data') {
    chips.push({
      key: 'anonymity',
      label:
        attributes.user_data_collection === 'anonymous'
          ? formatMessage(messages.anonymous)
          : formatMessage(messages.piiExcluded),
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
  signInLabel: string,
  formatMessage: FormatMessage
): SummaryChip[] => {
  const { attributes } = permission;

  if (attributes.permitted_by === 'admins_moderators') {
    return [
      {
        key: 'admins',
        label: formatMessage(messages.adminsManagersOnly),
        icon: 'shield-checkered',
        tone: 'access',
      },
    ];
  }

  if (attributes.permitted_by === 'everyone') {
    return [
      {
        key: 'open',
        label: formatMessage(messages.anyoneCanParticipate),
        icon: 'user-circle',
        tone: 'open'
      },
      ...demographicsChip(customFields, formatMessage),
    ];
  }

  const chips: SummaryChip[] = [
    { key: 'signin', label: signInLabel, icon: 'shield-checkered', tone: 'access' },
  ];
  const groupIds = getGroupIds(permission);
  if (groupIds.length > 0) {
    chips.push({
      key: 'groups',
      label: formatMessage(messages.nGroups, { nGroups: groupIds.length }),
      icon: 'group',
      tone: 'access',
    });
  }
  if (attributes.require_name) {
    chips.push({
      key: 'name',
      label: formatMessage(messages.name),
      icon: 'user-circle',
      tone: 'data'
    });
  }
  chips.push(...demographicsChip(customFields, formatMessage));
  if (attributes.user_data_collection !== 'all_data') {
    chips.push({
      key: 'anonymity',
      label:
        attributes.user_data_collection === 'anonymous'
          ? formatMessage(messages.anonymous)
          : formatMessage(messages.piiExcluded),
      icon: 'user-circle',
      tone: 'data',
    });
  }
  return chips;
};

/** Readable name of the fixed SSO sign-in method */
export const ssoMethodName = (authenticationMethod?: IdMethod): string =>
  authenticationMethod?.data.attributes.method_metadata?.name ?? '';

// ---- One-line summaries shown on the collapsed setting rows ----
export const groupsSummary = (
  permission: IPhasePermissionData,
  formatMessage: FormatMessage
): string => {
  const n = getGroupIds(permission).length;
  if (n === 0) return formatMessage(messages.everyoneWhoSignsIn);
  return formatMessage(messages.nGroups, { nGroups: n });
};

export const piiSummary = (
  permission: IPhasePermissionData,
  formatMessage: FormatMessage
): string => {
  const parts: string[] = [];
  if (permission.attributes.require_name) parts.push(formatMessage(messages.name));
  if (permission.attributes.require_password) parts.push(formatMessage(messages.password));
  return parts.length ? parts.join(' · ') : formatMessage(messages.nothingExtra);
};

export const demographicsSummary = (
  customFields: IPermissionsPhaseCustomFieldData[],
  formatMessage: FormatMessage
): string => {
  const n = customFields.length;
  return n === 0 ? formatMessage(messages.none) : formatMessage(messages.nQuestions, { nQuestions: n });
};

export const DATA_COLLECTION_SUMMARY: Record<UserDataCollection, MessageDescriptor> = {
  all_data: messages.linkedToProfile,
  demographics_only: messages.piiExcludedFromResults,
  anonymous: messages.fullyAnonymous,
};

// The "rules engine". All the cross-setting dependencies live here, in one
// place, so the UI components stay dumb. Every helper reads from the
// `IPhasePermissionData` shape (plus the list of permission custom fields that
// holds the demographics). The panel is stateless, so nothing here mutates:
// writes are expressed as `Changes` for `onChange`.
import { FormatMessage } from 'typings';

import { IPermissionsPhaseCustomFieldData } from 'api/permissions_phase_custom_fields/types';
import { IPhasePermissionData } from 'api/phase_permissions/types';

import messages from './messages';

/** Group ids the action is limited to (OR semantics). */
export const getGroupIds = (permission: IPhasePermissionData): string[] =>
  permission.relationships.groups.data.map((g) => g.id);

/** Does participation require an account? Driven by `permitted_by`. */
export const requiresAccount = (permission: IPhasePermissionData): boolean =>
  permission.attributes.permitted_by === 'users';

export interface SummaryChip {
  key: string;
  label: string;
  icon:
    | 'user-circle'
    | 'email'
    | 'tablet'
    | 'comment'
    | 'shield-checkered'
    | 'group'
    | 'lock'
    | 'user-data';
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
        tone: 'open',
      },
      ...demographicsChip(customFields, formatMessage),
    ];
  }

  // Signing in is a requirement in its own right, independent of the security
  // checks below it — a permission can require an account and nothing else.
  const chips: SummaryChip[] = [
    {
      key: 'signin',
      label: formatMessage(messages.signInRequired),
      icon: 'shield-checkered',
      tone: 'access',
    },
  ];
  if (attributes.require_confirmed_email) {
    chips.push({
      key: 'email',
      label: formatMessage(messages.confirmedEmail),
      icon: 'email',
      tone: 'access',
    });
  }
  if (attributes.require_confirmed_phone_number) {
    chips.push({
      key: 'phone',
      label: formatMessage(messages.confirmedPhone),
      icon: 'tablet',
      tone: 'access',
    });
  }
  if (attributes.require_verification) {
    chips.push({
      key: 'verification',
      label: formatMessage(messages.verification),
      icon: 'shield-checkered',
      tone: 'access',
    });
  }

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
      tone: 'data',
    });
  }
  if (attributes.require_password) {
    chips.push({
      key: 'password',
      label: formatMessage(messages.password),
      icon: 'lock',
      tone: 'data',
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

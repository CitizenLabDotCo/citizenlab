// The "rules engine". All the cross-setting dependencies live here, in one
// place, so the UI components stay dumb. Every helper reads from the
// `IPhasePermissionData` shape (plus the list of permission custom fields that
// holds the demographics). The panel is stateless, so nothing here mutates:
// writes are expressed as `Changes` for `onChange`.
import { FormatMessage } from 'typings';

import { IPermissionsPhaseCustomFieldData } from 'api/permissions_phase_custom_fields/types';
import {
  EmailAndPhoneRequirements,
  IPhasePermissionData,
  UserDataCollection,
} from 'api/phase_permissions/types';

import { MessageDescriptor } from 'utils/cl-intl';

import { AUTH_METHOD_LABELS } from './AccessSections/constants';
import { CHANNEL_EXPIRY_FIELDS, CHANNEL_ICONS } from './constants';
import messages from './messages';
import { ContactChannel, Changes } from './types';

/** The enabled flag + expiry (in days, `null` = "once, ever") for verification. */
export const getVerification = (
  permission: IPhasePermissionData
): { enabled: boolean; expiry: number | null } => ({
  enabled: permission.attributes.require_verification,
  expiry: permission.attributes.verification_expiry,
});

/** The change to emit when verification's toggle / recency is edited. */
export const verificationChange = ({
  enabled,
  expiry,
}: {
  enabled: boolean;
  expiry: number | null;
}): Changes => ({
  require_verification: enabled,
  verification_expiry: expiry,
});

/** Which contact details participants must confirm. */
export const getContactRequirement = (permission: IPhasePermissionData) =>
  permission.attributes.email_and_phone_requirements;

/**
 * How recently a channel must have been confirmed (in days, `0` = every 30
 * minutes, `null` = confirm once, ever).
 */
export const getChannelExpiry = (
  permission: IPhasePermissionData,
  channel: ContactChannel
): number | null => permission.attributes[CHANNEL_EXPIRY_FIELDS[channel]];

/** The change to emit when a channel's recency is edited. */
export const channelExpiryChange = (
  channel: ContactChannel,
  expiry: number | null
): Changes => ({ [CHANNEL_EXPIRY_FIELDS[channel]]: expiry });

// Which channels a requirement puts in play, and so which ones can carry their
// own confirmation expiry.
export const CHANNELS_IN_PLAY: Record<
  EmailAndPhoneRequirements,
  ContactChannel[]
> = {
  neither: [],
  email_only: ['email'],
  both_email_and_phone: ['email', 'phone'],
  either_email_or_phone: ['email', 'phone'],
};

/** Group ids the action is limited to (OR semantics). */
export const getGroupIds = (permission: IPhasePermissionData): string[] =>
  permission.relationships.groups.data.map((g) => g.id);

/** Does participation require an account? Driven by `permitted_by`. */
export const requiresAccount = (permission: IPhasePermissionData): boolean =>
  permission.attributes.permitted_by === 'users';

type ChipIcon =
  | 'user-circle'
  | 'email'
  | 'tablet'
  | 'comment'
  | 'shield-checkered'
  | 'group'
  | 'lock'
  | 'user-data';

export interface SummaryChip {
  key: string;
  label: string;
  icon: ChipIcon;
  /**
   * A second glyph, joined to the first by "or". Only the either/or contact
   * requirement uses it, so the chip reads like the IconCluster on the
   * contact-details control instead of showing just one of the two channels.
   */
  altIcon?: ChipIcon;
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

  const chips: SummaryChip[] = [];

  // 'either_email_or_phone' is one requirement, not two, so it gets one chip -
  // otherwise it would read exactly like requiring both.
  const requirement = getContactRequirement(permission);
  if (requirement === 'either_email_or_phone') {
    chips.push({
      key: 'email_or_phone',
      label: formatMessage(messages.confirmedEmailOrPhoneNumber),
      icon: CHANNEL_ICONS.email,
      altIcon: CHANNEL_ICONS.phone,
      tone: 'access',
    });
  } else {
    CHANNELS_IN_PLAY[requirement].forEach((channel) => {
      chips.push({
        key: channel,
        label: formatMessage(AUTH_METHOD_LABELS[channel]),
        icon: CHANNEL_ICONS[channel],
        tone: 'access',
      });
    });
  }

  if (getVerification(permission).enabled) {
    chips.push({
      key: 'verification',
      label: formatMessage(AUTH_METHOD_LABELS.verification),
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

// Summary for the SSO variant: the identification method is fixed, so the per-method
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
        tone: 'open',
      },
      ...demographicsChip(customFields, formatMessage),
    ];
  }

  const chips: SummaryChip[] = [
    {
      key: 'signin',
      label: signInLabel,
      icon: 'shield-checkered',
      tone: 'access',
    },
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
  formatMessage: FormatMessage,
  // Password is never asked when password login is off, so it must not appear
  // in the summary either - it would advertise a field that can't be collected.
  showPassword = true
): string => {
  const parts: string[] = [];
  if (permission.attributes.require_name) {
    parts.push(formatMessage(messages.name));
  }
  if (showPassword && permission.attributes.require_password) {
    parts.push(formatMessage(messages.password));
  }
  return parts.length
    ? parts.join(' · ')
    : formatMessage(messages.nothingExtra);
};

export const demographicsSummary = (
  customFields: IPermissionsPhaseCustomFieldData[],
  formatMessage: FormatMessage
): string => {
  const n = customFields.length;
  return n === 0
    ? formatMessage(messages.none)
    : formatMessage(messages.nQuestions, { nQuestions: n });
};

export const DATA_COLLECTION_SUMMARY: Record<
  UserDataCollection,
  MessageDescriptor
> = {
  all_data: messages.linkedToProfile,
  demographics_only: messages.piiExcludedFromResults,
  anonymous: messages.fullyAnonymous,
};

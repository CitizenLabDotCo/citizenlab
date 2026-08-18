// The "rules engine". All the cross-setting dependencies live here, in one
// place, so the UI components stay dumb. Every helper reads from the
// `IPermissionData` shape (plus the list of permission custom fields that
// holds the demographics, and the platform config that decides which security
// requirements can be configured at all). The panel is stateless, so nothing
// here mutates: writes are expressed as `Changes` for `onChange`.
import { FormatMessage } from 'typings';

import useIdMethods from 'api/id_methods/useIdMethods';
import useVerificationMethod from 'api/id_methods/useVerificationMethod';
import { IPermissionData } from 'api/permissions/types';
import { IPermissionsPhaseCustomFieldData } from 'api/permissions_phase_custom_fields/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import messages from './messages';

/** Group ids the action is limited to (OR semantics). */
export const getGroupIds = (permission: IPermissionData): string[] =>
  permission.relationships.groups.data.map((g) => g.id);

/** Does participation require an account? Driven by `permitted_by`. */
export const requiresAccount = (permission: IPermissionData): boolean =>
  permission.attributes.permitted_by === 'users';

// The security requirements on offer: each one maps onto a `require_*` boolean
// + `*_expiry` pair on the permission.
type SecurityRequirementKey = 'email' | 'phone' | 'verification' | 'password';
export type VisibleToggles = Record<SecurityRequirementKey, boolean>;

type VisibleTogglesParams = {
  sms2FAEnabled: boolean;
  smsLoginEnabled: boolean;
  verificationMethodEnabled: boolean;
  hasAuthMethodNotReturningEmail: boolean;
  passwordLoginEnabled: boolean;
};

export const getVisibleToggles = ({
  sms2FAEnabled,
  smsLoginEnabled,
  verificationMethodEnabled,
  hasAuthMethodNotReturningEmail,
  passwordLoginEnabled,
}: VisibleTogglesParams): VisibleToggles => {
  const visibleToggles: VisibleToggles = {
    email: false,
    phone: false,
    verification: false,
    password: false,
  };

  if ((sms2FAEnabled && smsLoginEnabled) || hasAuthMethodNotReturningEmail) {
    // Requiring an email or not is only relevant if there exists
    // a way for participants to sign up WITHOUT an email address.
    // If you e.g. can only sign up with email, email confirmed is always required,
    // so there is no need to make it configurable.
    visibleToggles.email = true;
  }

  if (sms2FAEnabled) {
    visibleToggles.phone = true;
  }

  if (verificationMethodEnabled) {
    visibleToggles.verification = true;
  }

  if (passwordLoginEnabled) {
    // A password is only ever set when signing up by email, so requiring one
    // is meaningless on a platform where that is not a way in.
    visibleToggles.password = true;
  }

  return visibleToggles;
};

/**
 * Which security requirements this platform can offer at all, read from live
 * config. Both the toggles and the summaries go through this, so a requirement
 * that cannot be configured never shows up in a summary either — however the
 * permission was left when the platform config changed.
 *
 * Undefined while the sign-in methods are still loading.
 */
export const useVisibleToggles = (): VisibleToggles | undefined => {
  const sms2FAEnabled = useFeatureFlag({ name: 'sms' });
  const smsLoginEnabled = useFeatureFlag({ name: 'sms_login' });
  const passwordLoginEnabled = useFeatureFlag({ name: 'password_login' });
  const { data: verificationMethod } = useVerificationMethod();
  const { data: idMethods } = useIdMethods();

  if (!idMethods) return undefined;

  const hasAuthMethodNotReturningEmail = idMethods.data.some(
    (method) =>
      method.attributes.authentication_method &&
      method.attributes.method_metadata?.email_always_present === false
  );

  return getVisibleToggles({
    sms2FAEnabled,
    smsLoginEnabled,
    verificationMethodEnabled: !!verificationMethod,
    hasAuthMethodNotReturningEmail,
    passwordLoginEnabled,
  });
};

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
    },
  ];
};

export const buildSummary = (
  permission: IPermissionData,
  customFields: IPermissionsPhaseCustomFieldData[],
  formatMessage: FormatMessage,
  visibleToggles: VisibleToggles
): SummaryChip[] => {
  const { attributes } = permission;

  if (attributes.permitted_by === 'admins_moderators') {
    return [
      {
        key: 'admins',
        label: formatMessage(messages.adminsManagersOnly),
        icon: 'shield-checkered',
      },
    ];
  }

  if (!requiresAccount(permission)) {
    return [
      {
        key: 'open',
        label: formatMessage(messages.anyoneCanParticipate),
        icon: 'user-circle',
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
    },
  ];
  // A requirement the platform does not offer (no SMS, no verification method,
  // ...) is not something the admin can act on, so it stays out of the summary
  // even when the permission still carries the flag.
  if (visibleToggles.email && attributes.require_confirmed_email) {
    chips.push({
      key: 'email',
      label: formatMessage(messages.confirmedEmail),
      icon: 'email',
    });
  }
  if (visibleToggles.phone && attributes.require_confirmed_phone_number) {
    chips.push({
      key: 'phone',
      label: formatMessage(messages.confirmedPhone),
      icon: 'tablet',
    });
  }
  if (visibleToggles.verification && attributes.require_verification) {
    chips.push({
      key: 'verification',
      label: formatMessage(messages.verification),
      icon: 'shield-checkered',
    });
  }
  if (visibleToggles.password && attributes.require_password) {
    chips.push({
      key: 'password',
      label: formatMessage(messages.password),
      icon: 'lock',
    });
  }

  const groupIds = getGroupIds(permission);
  if (groupIds.length > 0) {
    chips.push({
      key: 'groups',
      label: formatMessage(messages.nGroups, { nGroups: groupIds.length }),
      icon: 'group',
    });
  }

  if (attributes.require_name) {
    chips.push({
      key: 'name',
      label: formatMessage(messages.name),
      icon: 'user-circle',
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
    });
  }

  return chips;
};

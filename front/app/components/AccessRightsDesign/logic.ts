// Design prototype – the "rules engine". All the cross-setting dependencies the
// brief calls out live here, in one place, so the UI components stay dumb.

import { AUTH_METHOD_LABELS, DEMOGRAPHIC_FIELDS } from './data';
import {
  AccessConfig,
  AuthMethodKey,
  PlatformSettings,
} from './types';

/** Is a given authentication method offered by the platform at all? */
export const isMethodAvailable = (
  method: AuthMethodKey,
  settings: PlatformSettings
): boolean => {
  switch (method) {
    case 'email':
      // Confirmed email needs password login (email/OTP infra) enabled.
      return settings.passwordLoginEnabled;
    case 'phone':
      return settings.phoneConfirmationAllowed;
    case 'verification':
      return settings.verificationAllowed;
  }
};

/** Does participation require an account? Driven by the explicit top choice. */
export const requiresAccount = (config: AccessConfig): boolean =>
  config.mode === 'account';

/** With an account required, has the user actually picked a method yet? */
export const hasEnabledMethod = (config: AccessConfig): boolean =>
  config.methods.email.enabled ||
  config.methods.phone.enabled ||
  config.methods.verification.enabled;

/** Only 'anyone' forces demographics onto a form page; others allow either. */
export const placementLocked = (config: AccessConfig): boolean =>
  config.mode === 'anyone';

/**
 * Force a config into a valid state given the current platform settings.
 * This encodes the "tricky parts" from the brief:
 *  - methods the platform doesn't offer are switched off;
 *  - access controls (methods, groups, PII, anonymity) need an account, so
 *    they clear when the action is open to anyone or limited to admins;
 *  - demographic questions can still be collected in every mode, but without
 *    an account they can only be asked on a form page, not in registration;
 *  - a password only makes sense alongside the confirmed-email account.
 */
export const normalize = (
  config: AccessConfig,
  settings: PlatformSettings
): AccessConfig => {
  const hasAccount = config.mode === 'account';

  const methods = { ...config.methods };
  (Object.keys(methods) as AuthMethodKey[]).forEach((key) => {
    // No account => no methods; otherwise drop methods the platform can't offer.
    if (!hasAccount || !isMethodAvailable(key, settings)) {
      methods[key] = { enabled: false, recency: null };
    }
  });

  return {
    ...config,
    methods,
    // Account-only settings: nobody to restrict, store PII against, or
    // anonymise without an account.
    groupIds: hasAccount ? config.groupIds : [],
    pii: {
      name: hasAccount ? config.pii.name : false,
      // Password requires the email/password account specifically.
      password: hasAccount && methods.email.enabled ? config.pii.password : false,
    },
    dataCollection: hasAccount ? config.dataCollection : 'all_data',
    // Demographics survive every mode; only their placement is constrained.
    demographicsPlacement:
      config.mode === 'anyone' ? 'form_page' : config.demographicsPlacement,
  };
};

// ---- Human-readable summary, used both for the collapsed header and a11y ----

export interface SummaryChip {
  key: string;
  label: string;
  icon: 'user-circle' | 'email' | 'comment' | 'shield-checkered' | 'group' | 'lock' | 'user-data';
  tone: 'access' | 'data' | 'open';
}

// Demographic questions can be collected in every mode, so this chip is shared.
const demographicsChip = (config: AccessConfig): SummaryChip[] => {
  if (config.demographics.length === 0) return [];
  const n = config.demographics.length;
  return [
    {
      key: 'demographics',
      label: `${n} question${n > 1 ? 's' : ''}`,
      icon: 'user-data',
      tone: 'data',
    },
  ];
};

export const buildSummary = (config: AccessConfig): SummaryChip[] => {
  if (config.mode === 'admins') {
    return [
      {
        key: 'admins',
        label: 'Admins & managers only',
        icon: 'shield-checkered',
        tone: 'access',
      },
      ...demographicsChip(config),
    ];
  }

  if (!requiresAccount(config)) {
    return [
      { key: 'open', label: 'Anyone can participate', icon: 'user-circle', tone: 'open' },
      ...demographicsChip(config),
    ];
  }

  const chips: SummaryChip[] = [];
  const methodIcon: Record<AuthMethodKey, SummaryChip['icon']> = {
    email: 'email',
    phone: 'comment',
    verification: 'shield-checkered',
  };
  (Object.keys(config.methods) as AuthMethodKey[]).forEach((key) => {
    if (config.methods[key].enabled) {
      chips.push({
        key,
        label: AUTH_METHOD_LABELS[key],
        icon: methodIcon[key],
        tone: 'access',
      });
    }
  });

  // Account required but no method chosen yet.
  if (!hasEnabledMethod(config)) {
    chips.push({
      key: 'account',
      label: 'Sign-in required',
      icon: 'user-circle',
      tone: 'access',
    });
  }

  if (config.groupIds.length > 0) {
    chips.push({
      key: 'groups',
      label: `${config.groupIds.length} group${config.groupIds.length > 1 ? 's' : ''}`,
      icon: 'group',
      tone: 'access',
    });
  }

  if (config.pii.name) {
    chips.push({ key: 'name', label: 'Name', icon: 'user-circle', tone: 'data' });
  }
  if (config.pii.password) {
    chips.push({ key: 'password', label: 'Password', icon: 'lock', tone: 'data' });
  }

  chips.push(...demographicsChip(config));

  if (config.dataCollection !== 'all_data') {
    chips.push({
      key: 'anonymity',
      label: config.dataCollection === 'anonymous' ? 'Anonymous' : 'PII excluded',
      icon: 'user-circle',
      tone: 'data',
    });
  }

  return chips;
};

export const demographicTitle = (fieldId: string): string =>
  DEMOGRAPHIC_FIELDS.find((f) => f.id === fieldId)?.title ?? fieldId;

// ---- One-line summaries shown on the collapsed setting rows ----

export const groupsSummary = (config: AccessConfig): string => {
  const n = config.groupIds.length;
  if (n === 0) return 'Everyone who signs in';
  return `${n} group${n > 1 ? 's' : ''}`;
};

export const piiSummary = (config: AccessConfig): string => {
  const parts: string[] = [];
  if (config.pii.name) parts.push('Name');
  if (config.pii.password) parts.push('Password');
  return parts.length ? parts.join(' · ') : 'Nothing extra';
};

export const demographicsSummary = (config: AccessConfig): string => {
  const n = config.demographics.length;
  return n === 0 ? 'None' : `${n} question${n > 1 ? 's' : ''}`;
};

export const DATA_COLLECTION_SUMMARY: Record<
  AccessConfig['dataCollection'],
  string
> = {
  all_data: 'Linked to profile',
  demographics_only: 'PII excluded from results',
  anonymous: 'Fully anonymous',
};

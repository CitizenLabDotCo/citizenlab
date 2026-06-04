// Design prototype – mock data + defaults so the panel is self-contained and
// runnable without a backend. In the real component these would come from
// `useGroups`, the global user-custom-fields API and the AppConfiguration.

import { SupportedLocale } from 'typings';

import {
  AccessConfig,
  AuthMethodKey,
  PlatformSettings,
  TimeUnit,
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

// Globally configured demographic fields, shared across all actions.
export const DEMOGRAPHIC_FIELDS: DemographicField[] = [
  { id: 'gender', title: 'Gender' },
  { id: 'birthyear', title: 'Year of birth' },
  { id: 'domicile', title: 'Place of residence' },
  { id: 'education', title: 'Education level' },
  { id: 'languages', title: 'Languages spoken' },
];

export const TIME_UNIT_LABELS: Record<TimeUnit, string> = {
  days: 'days',
  weeks: 'weeks',
  months: 'months',
};

export const AUTH_METHOD_LABELS: Record<AuthMethodKey, string> = {
  email: 'Confirmed email',
  phone: 'Confirmed phone number',
  verification: 'Identity verification',
};

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  passwordLoginEnabled: true,
  phoneConfirmationAllowed: true,
  verificationAllowed: true,
  verificationMethodName: 'FranceConnect',
};

export const DEFAULT_CONFIG: AccessConfig = {
  mode: 'account',
  methods: {
    email: { enabled: true, recency: null },
    phone: { enabled: false, recency: null },
    verification: { enabled: false, recency: null },
  },
  groupIds: [],
  accessDeniedMultiloc: {},
  pii: { name: false, password: false },
  demographics: [],
  demographicsPlacement: 'registration',
  dataCollection: 'all_data',
};

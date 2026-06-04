// Design prototype – mock data + defaults so the panel is self-contained and
// runnable without a backend. In the real component these would come from
// `useGroups`, the global user-custom-fields API and the AppConfiguration.

import {
  AccessConfig,
  AuthMethodKey,
  PlatformSettings,
  TimeUnit,
} from './types';

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
  pii: { name: false, password: false },
  demographics: [],
  dataCollection: 'all_data',
};

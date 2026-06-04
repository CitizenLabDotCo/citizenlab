// Design prototype – data model for the "Participation requirements" panel.
//
// Note on the model: the live backend bundles these settings into a single
// `permitted_by` enum (everyone / everyone_confirmed_email / users / verified).
// This prototype deliberately uses an *independent, composable* model — each
// authentication method, each PII field and each demographic question is its
// own switch — because that is what the brief describes (choose "zero, one or
// more" methods, toggle name and password separately, etc.). See index.tsx for
// where the two models meet and the README note in the chat for the trade-off.

export type TimeUnit = 'days' | 'weeks' | 'months';

// `null` means "confirmation never expires" (confirm once, ever).
export type Recency = { value: number; unit: TimeUnit } | null;

export type AuthMethodKey = 'email' | 'phone' | 'verification';

export interface AuthMethodState {
  enabled: boolean;
  recency: Recency;
}

export interface DemographicSelection {
  fieldId: string;
  required: boolean;
}

// Explicit top-level choice: anyone, require an account, or staff only.
export type AccessMode = 'anyone' | 'account' | 'admins';

// How collected data is associated with the submission / results.
// Mirrors the backend `user_data_collection` enum. This is about *linking*,
// not *collecting*: you can ask for a name yet keep the submission anonymous.
export type DataCollection = 'all_data' | 'demographics_only' | 'anonymous';

export interface AccessConfig {
  mode: AccessMode;
  methods: Record<AuthMethodKey, AuthMethodState>;
  groupIds: string[];
  pii: {
    name: boolean; // first + last name, toggled as a pair
    password: boolean;
  };
  demographics: DemographicSelection[];
  dataCollection: DataCollection;
}

// Platform-level settings that constrain what is *available* in the panel.
// In the real app these come from the AppConfiguration settings schema
// (e.g. `password_login`) and from the configured verification method.
export interface PlatformSettings {
  passwordLoginEnabled: boolean;
  phoneConfirmationAllowed: boolean;
  verificationAllowed: boolean;
  verificationMethodName: string;
}

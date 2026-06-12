// Static labels and default copy for the panel. All the real data (locales,
// groups, demographic fields, the verification method and the fields it
// returns) is fetched from the API by the components that need it.

import { AuthMethodKey } from './types';

// Default shown to users who don't meet the requirements.
export const DEFAULT_ACCESS_DENIED_MESSAGE =
  'You do not meet the requirements to participate in this process.';

export const AUTH_METHOD_LABELS: Record<AuthMethodKey, string> = {
  email: 'Confirmed email',
  verification: 'Identity verification',
};

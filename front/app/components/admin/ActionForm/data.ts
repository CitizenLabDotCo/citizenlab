// Static labels and default copy for the panel. All the real data (locales,
// groups, demographic fields, the verification method and the fields it
// returns) is fetched from the API by the components that need it.

import { AuthMethodKey } from './types';

export const AUTH_METHOD_LABELS: Record<AuthMethodKey, string> = {
  email: 'Confirmed email',
  verification: 'Identity verification',
};

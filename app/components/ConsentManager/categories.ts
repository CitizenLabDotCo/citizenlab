export type IDestination = 'intercom' | 'satismeter' | 'google_analytics';

export const MARKETING_AND_ANALYTICS_DESTINATIONS = [
  'google_analytics',
  'satismeter',
] as IDestination[];

export const ADVERTISING_DESTINATIONS = [] as IDestination[];

export const FUNCTIONAL_DESTINATIONS = ['intercom'] as IDestination[];

// Destinations only for admins, no super admins nor user
export const ADMIN_DESTINATIONS = ['intercom', 'satismeter'] as IDestination[];

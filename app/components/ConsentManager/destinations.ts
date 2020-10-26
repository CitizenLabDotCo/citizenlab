export type IDestination =
  | 'intercom'
  | 'satismeter'
  | 'google_analytics'
  | 'google_tag_manager';

export const MARKETING_AND_ANALYTICS_DESTINATIONS = [
  'google_analytics',
  'satismeter',
] as IDestination[];

export const ADVERTISING_DESTINATIONS = [
  'google_tag_manager',
] as IDestination[];

export const FUNCTIONAL_DESTINATIONS = ['intercom'] as IDestination[];

export const DESTINATIONS = MARKETING_AND_ANALYTICS_DESTINATIONS.concat(
  ADVERTISING_DESTINATIONS
).concat(FUNCTIONAL_DESTINATIONS);

// Destinations only for admins, no super admins nor user
export const ADMIN_DESTINATIONS = ['intercom', 'satismeter'] as IDestination[];

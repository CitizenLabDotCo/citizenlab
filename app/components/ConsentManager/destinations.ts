export interface IDestinationMap {
  satismeter: 'satismeter';
  google_analytics: 'google_analytics';
}

export type IDestination = IDestinationMap[keyof IDestinationMap];

export const MARKETING_AND_ANALYTICS_DESTINATIONS = [
  'google_analytics',
  'satismeter',
] as IDestination[];

export const ADVERTISING_DESTINATIONS = [
  'google_tag_manager',
] as IDestination[];

export const FUNCTIONAL_DESTINATIONS = ['intercom'] as IDestination[];

export const DESTINATIONS = [
  ...MARKETING_AND_ANALYTICS_DESTINATIONS,
  ...ADVERTISING_DESTINATIONS,
  ...FUNCTIONAL_DESTINATIONS,
];

// Destinations only for admins & moderators, no super admins nor user
export const ADMIN_DESTINATIONS = ['intercom', 'satismeter'];

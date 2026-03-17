import messages from './Filters/messages';

export const FILTER_CONFIG = {
  managers: messages.manager,
  status: messages.status,
  folder_ids: messages.folders,
  participation_states: messages.participationStates,
  participation_methods: messages.participationMethodLabel,
  visibility: messages.visibilityLabel,
  discoverability: messages.discoverabilityLabel,
  space_ids: messages.spaces,
} as const;

export type FilterKey = keyof typeof FILTER_CONFIG;

export const FILTER_KEYS: FilterKey[] = [
  'managers',
  'status',
  'folder_ids',
  'participation_states',
  'participation_methods',
  'visibility',
  'discoverability',
  'space_ids',
];

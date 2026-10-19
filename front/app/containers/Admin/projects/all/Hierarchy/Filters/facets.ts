import { IconNames } from '@citizenlab/cl2-component-library';

import { ParticipationState } from 'api/projects_mini_admin/types';

import { MessageDescriptor } from 'utils/cl-intl';

import filterMessages from '../../_shared/FilterBar/Filters/messages';
import { Level } from '../level';

// The filters, in the menu's order, with the names they have on the old page.
// Each is a URL param of the same name, except the start date, which is two.
export const facetKeys = [
  'managers',
  'display_status',
  'folder_ids',
  'participation_states',
  'participation_methods',
  'visibility',
  'discoverability',
  'space_ids',
  'start_date',
] as const;

export type FacetKey = (typeof facetKeys)[number];

// The filters picked from a list of options.
export type ListFacetKey = Exclude<FacetKey, 'start_date'>;

export const isListFacet = (key: FacetKey): key is ListFacetKey =>
  key !== 'start_date';

export const FACETS: Record<
  FacetKey,
  { label: MessageDescriptor; icon: IconNames }
> = {
  managers: { label: filterMessages.manager, icon: 'user' },
  display_status: { label: filterMessages.status, icon: 'flag' },
  folder_ids: { label: filterMessages.folders, icon: 'folder-outline' },
  participation_states: {
    label: filterMessages.participationStates,
    icon: 'clock',
  },
  participation_methods: {
    label: filterMessages.participationMethodLabel,
    icon: 'categories',
  },
  visibility: { label: filterMessages.visibilityLabel, icon: 'eye' },
  discoverability: { label: filterMessages.discoverabilityLabel, icon: 'link' },
  space_ids: { label: filterMessages.spaces, icon: 'spaces' },
  start_date: { label: filterMessages.projectStartDate, icon: 'calendar' },
};

type FacetAccess = {
  spacesEnabled: boolean;
  canListSpaces: boolean;
  canListFolders: boolean;
};

// The filters a level offers: the spaces filter only at the top, the folders
// filter everywhere but inside a folder, as the level already narrows to that.
export const getOfferedFacets = (
  level: Level,
  { spacesEnabled, canListSpaces, canListFolders }: FacetAccess
): FacetKey[] =>
  facetKeys.filter((key) => {
    if (key === 'space_ids') {
      return level.kind === 'root' && spacesEnabled && canListSpaces;
    }
    if (key === 'folder_ids') return level.kind !== 'folder' && canListFolders;
    return true;
  });

// The choices of the participation state filter, each with the states it
// stands for. "Not started" isn't one: it belongs to the old page, where it
// also covers projects without phases.
export const STATE_CHOICES: Record<
  'open' | 'startingSoon' | 'ended' | 'noPhases',
  ParticipationState[]
> = {
  open: ['collecting_data', 'informing'],
  startingSoon: ['starting_soon'],
  ended: ['past'],
  noPhases: ['no_phases'],
};

// The states a link asks for, as whole choices: part of "Open" gets all of
// it, and a state no choice offers is dropped, so the chips and menu show
// exactly what the list is filtered by.
export const toStateChoices = (states: readonly ParticipationState[]) =>
  Object.values(STATE_CHOICES).flatMap((choice) =>
    choice.some((state) => states.includes(state)) ? choice : []
  );

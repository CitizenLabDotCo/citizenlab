import { Parameters } from 'api/projects_mini_admin/types';

import { DEFAULT_SORT } from './constants';
import { FILTER_KEYS } from './FilterBar/constants';
import { Parameter } from './params';

export const FOLDER_FILTERS: Parameter[] = [
  'managers',
  'status',
  'space_ids',
  'search',
];

// Each group counts as one filter, so a date range is a single filter.
const PROJECT_FILTER_GROUPS: Parameter[][] = [
  ...FILTER_KEYS.map((key) => [key]),
  ['review_state'],
  ['min_start_date', 'max_start_date'],
  ['search'],
];

const hasValue = (value: unknown) =>
  (typeof value === 'string' || Array.isArray(value)) && value.length > 0;

/**
 * The number of filters applied to the given overview tab (projects, which
 * shares its filters with the calendar, or folders). A non-default sort
 * counts as a filter too.
 */
export const countActiveFilters = (
  params: Partial<Parameters>,
  tab: string | undefined
) => {
  if (tab === 'folders') {
    return FOLDER_FILTERS.filter((paramName) => hasValue(params[paramName]))
      .length;
  }

  if (tab === undefined || tab === 'calendar') {
    const filterCount = PROJECT_FILTER_GROUPS.filter((group) =>
      group.some((paramName) => hasValue(params[paramName]))
    ).length;
    const hasNonDefaultSort = !!params.sort && params.sort !== DEFAULT_SORT;

    return filterCount + (hasNonDefaultSort ? 1 : 0);
  }

  return 0;
};

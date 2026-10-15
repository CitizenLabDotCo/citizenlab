import { ProjectSortableParam } from 'api/projects_mini_admin/types';

import { COLUMNS, ColumnKey, ColumnSort } from './columns';

const withDirection = (
  sort: ColumnSort,
  direction: 'asc' | 'desc'
): ProjectSortableParam => `${sort}_${direction}`;

// Clicking a column header orders by it, then reverses, then goes back to the
// default order. Numbers and dates start with the biggest or latest.
export const getNextSort = (
  column: ColumnKey,
  current: ProjectSortableParam | undefined
): ProjectSortableParam | undefined => {
  const { sort, startsDescending } = COLUMNS[column];
  if (!sort) return current;

  const first = withDirection(sort, startsDescending ? 'desc' : 'asc');
  const second = withDirection(sort, startsDescending ? 'asc' : 'desc');

  if (current === first) return second;
  if (current === second) return undefined;
  return first;
};

// Which way the list is ordered by this column, if it is.
export const getSortDirection = (
  column: ColumnKey,
  current: ProjectSortableParam | undefined
) => {
  const { sort } = COLUMNS[column];
  if (!sort || !current) return undefined;
  if (current === withDirection(sort, 'asc')) return 'asc';
  if (current === withDirection(sort, 'desc')) return 'desc';
  return undefined;
};

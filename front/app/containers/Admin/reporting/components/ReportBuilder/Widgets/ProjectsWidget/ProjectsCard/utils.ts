import { isAfter, parseISO } from 'date-fns';
import { FormatMessage } from 'typings';

import { Period } from 'api/graph_data_units/responseTypes/ProjectsWidget';
import { ProjectSortableParam } from 'api/projects_mini_admin/types';

import projectFilterMessages from 'containers/Admin/projects/all/_shared/FilterBar/Filters/messages';

export const deriveProjectStatus = (period: Period, now: Date) => {
  const startAt = parseISO(period.start_at);
  const endAt = period.end_at ? parseISO(period.end_at) : null;

  if (isAfter(startAt, now)) {
    return 'planned';
  }

  if (endAt === null) {
    return 'open-ended';
  }

  return isAfter(now, endAt) ? 'finished' : 'active';
};

interface ISortOption {
  value: ProjectSortableParam;
  label: string;
}

export const getSortOptions = (formatMessage: FormatMessage): ISortOption[] => [
  {
    value: 'alphabetically_asc',
    label: formatMessage(projectFilterMessages.alphabetically_asc),
  },
  {
    value: 'alphabetically_desc',
    label: formatMessage(projectFilterMessages.alphabetically_desc),
  },
  {
    value: 'participation_asc',
    label: formatMessage(projectFilterMessages.participation_asc),
  },
  {
    value: 'participation_desc',
    label: formatMessage(projectFilterMessages.participation_desc),
  },
  {
    value: 'phase_starting_or_ending_soon',
    label: formatMessage(projectFilterMessages.phase_starting_or_ending_soon),
  },
  {
    value: 'recently_viewed',
    label: formatMessage(projectFilterMessages.recently_viewed),
  },
  {
    value: 'recently_created_asc',
    label: formatMessage(projectFilterMessages.recently_created_asc),
  },
  {
    value: 'recently_created_desc',
    label: formatMessage(projectFilterMessages.recently_created_desc),
  },
];

export type ProjectStatus = ReturnType<typeof deriveProjectStatus>;

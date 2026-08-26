import { EventProjectFilters } from 'api/events/types';

import { EventsSelectionMode } from './types';

export const filtersFor = (
  mode: EventsSelectionMode,
  ids: string[]
): EventProjectFilters => {
  switch (mode) {
    case 'all':
      return {};
    case 'projects':
      return { projectIds: ids };
    case 'global_topics':
      return { globalTopics: ids };
    case 'areas':
      return { areas: ids };
    case 'spaces':
      return { spaces: ids };
  }
};

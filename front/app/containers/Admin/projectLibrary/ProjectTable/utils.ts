import { format } from 'date-fns';

import { Status } from 'api/project_library_projects/types';

export const formatDuration = (date: string | null) => {
  if (!date) return '';
  return format(new Date(date), 'MMM yy');
};

export const STATUS_EMOJIS: Record<Status, string> = {
  draft: '🟤',
  active: '🟢',
  finished: '🟠',
  stale: '⚪',
  archived: '🔵',
};

export const STATUS_LABELS: Record<Status, string> = {
  draft: 'Draft',
  active: 'Active',
  finished: 'Finished',
  stale: 'Stale',
  archived: 'Archived',
};

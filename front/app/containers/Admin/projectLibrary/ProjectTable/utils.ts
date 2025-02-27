import { format } from 'date-fns';

import { ParticipationMethod } from 'api/phases/types';
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

export const PARTICIPATION_METHOD_LABELS: Record<ParticipationMethod, string> =
  {
    ideation: 'Ideation',
    information: 'Information',
    native_survey: 'Survey',
    survey: 'External survey',
    voting: 'Voting',
    poll: 'Poll',
    volunteering: 'Volunteering',
    document_annotation: 'Document annotation',
    proposals: 'Proposals',
  };

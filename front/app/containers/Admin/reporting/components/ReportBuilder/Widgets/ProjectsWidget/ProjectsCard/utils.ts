import moment, { Moment } from 'moment';

import { Period } from 'api/graph_data_units/responseTypes/ProjectsWidget';

const STALENESS_PERIOD = 30;

export const deriveProjectStatus = (period: Period, now: Moment) => {
  const startAt = moment(period.start_at);
  const lastPhaseStartAt = moment(period.last_phase_start_at);
  const endAt = period.end_at ? moment(period.end_at) : null;

  if (startAt.isAfter(now)) {
    return 'planned';
  }

  if (endAt === null) {
    const daysSinceLastPhaseStart = now.diff(lastPhaseStartAt, 'days');
    return daysSinceLastPhaseStart < STALENESS_PERIOD ? 'active' : 'stale';
  }

  return now.isAfter(endAt) ? 'finished' : 'active';
};

export type ProjectStatus = ReturnType<typeof deriveProjectStatus>;

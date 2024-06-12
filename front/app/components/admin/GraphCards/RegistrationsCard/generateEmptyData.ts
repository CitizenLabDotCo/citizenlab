import { Moment } from 'moment';

import { emptyDateRange } from 'components/admin/GraphCards/_utils/timeSeries';
import { IResolution } from 'components/admin/ResolutionControl';

import { getEmptyRow } from './useRegistrations/parse';
import { Stats } from './useRegistrations/typings';

export const generateEmptyData = (
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null | undefined,
  resolution: IResolution
) => {
  return emptyDateRange(startAtMoment, endAtMoment, resolution, (date, i) => ({
    ...getEmptyRow(date),
    ...(i === 0 ? { registrations: 10 } : {}),
  }));
};

export const emptyStatsData: Stats = {
  registrations: {
    value: '-',
    lastPeriod: '-',
  },
  registrationRate: {
    value: '-',
    lastPeriod: '-',
  },
};

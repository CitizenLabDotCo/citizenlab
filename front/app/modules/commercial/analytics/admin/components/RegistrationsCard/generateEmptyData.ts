// utils
// typings
import { Moment } from 'moment';
import { getEmptyRow } from '../../hooks/useRegistrations/parse';
import { Stats } from '../../hooks/useRegistrations/typings';
import { emptyDateRange } from '../../utils/timeSeries';
import { IResolution } from 'components/admin/ResolutionControl';

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

// utils
import { getEmptyRow } from '../../hooks/useActiveUsers/parse';
import { emptyDateRange } from '../../utils/timeSeries';

// typings
import { Moment } from 'moment';
import { IResolution } from 'components/admin/ResolutionControl';

export const generateEmptyData = (
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null | undefined,
  resolution: IResolution
) => {
  return emptyDateRange(startAtMoment, endAtMoment, resolution, (date, i) => ({
    ...getEmptyRow(date),
    ...(i === 0 ? { activeUsers: 10 } : {}),
  }));
};

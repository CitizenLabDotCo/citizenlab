// utils
import { getEmptyRow } from '../useVisitors/parse';
import { emptyDateRange } from '../../_utils/timeSeries';

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
    ...(i === 0 ? { visitors: 10, visits: 10 } : {}),
  }));
};

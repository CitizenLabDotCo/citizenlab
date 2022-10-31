import { dateRange, getEmptyRow } from '../../../hooks/useVisitors/parse/utils';
// typings
import moment, { Moment } from 'moment';
import { IResolution } from 'components/admin/ResolutionControl';

export const generateEmptyData = (
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null | undefined,
  resolution: IResolution
) => {
  const start = startAtMoment ?? moment().subtract({ month: 7 });
  const end = endAtMoment ?? moment();

  const dates = dateRange(start, end, resolution);
  if (dates === null) return [];

  return dates.map((date, i) => ({
    ...getEmptyRow(date),
    ...(i === 0 ? { visitors: 10, visits: 10 } : {}),
  }));
};

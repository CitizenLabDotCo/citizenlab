import { Moment } from 'moment';

import { emptyDateRange } from 'components/admin/GraphCards/_utils/timeSeries';
import { IResolution } from 'components/admin/ResolutionControl';

const getEmptyRow = (date: Moment) => ({
  date: date.format('YYYY-MM-DD'),
  inputs: 0,
  comments: 0,
  votes: 0,
});

export const generateEmptyData = (
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null | undefined,
  resolution: IResolution
) => {
  return emptyDateRange(startAtMoment, endAtMoment, resolution, (date, i) => ({
    ...getEmptyRow(date),
    ...(i === 0 ? { inputs: 10 } : {}),
  }));
};

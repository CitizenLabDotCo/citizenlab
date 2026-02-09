import { Moment } from 'moment';

import { emptyDateRange } from 'components/admin/GraphCards/_utils/timeSeries';
import { IResolution } from 'components/admin/ResolutionControl';

const getEmptyRow = (date: Moment) => ({
  date: date.format('YYYY-MM-DD'),
  totalActive: 0,
  activeAdmins: 0,
  activeModerators: 0,
});

export const generateEmptyData = (
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null | undefined,
  resolution: IResolution
) => {
  return emptyDateRange(startAtMoment, endAtMoment, resolution, (date) =>
    getEmptyRow(date)
  );
};

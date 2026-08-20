import { format } from 'date-fns';

import { emptyDateRange } from 'components/admin/GraphCards/_utils/timeSeries';
import { IResolution } from 'components/admin/ResolutionControl';

const getEmptyRow = (date: Date) => ({
  date: format(date, 'yyyy-MM-dd'),
  totalActive: 0,
  activeAdmins: 0,
  activeModerators: 0,
});

export const generateEmptyData = (
  startAtMoment: Date | null | undefined,
  endAtMoment: Date | null | undefined,
  resolution: IResolution
) => {
  return emptyDateRange(startAtMoment, endAtMoment, resolution, (date) =>
    getEmptyRow(date)
  );
};

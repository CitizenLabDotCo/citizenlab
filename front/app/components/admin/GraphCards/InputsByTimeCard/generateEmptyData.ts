import { emptyDateRange } from 'components/admin/GraphCards/_utils/timeSeries';
import { IResolution } from 'components/admin/ResolutionControl';

import { getEmptyRow } from './useInputsByTime/parse';

export const generateEmptyData = (
  startAtMoment: Date | null | undefined,
  endAtMoment: Date | null | undefined,
  resolution: IResolution
) => {
  return emptyDateRange(startAtMoment, endAtMoment, resolution, (date, i) => ({
    ...getEmptyRow(date),
    ...(i === 0 ? { inputs: 0 } : {}),
  }));
};

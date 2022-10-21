import { TimeSeriesResponse } from './typings';
import { IResolution } from 'components/admin/ResolutionControl';

export const deduceResolution = (
  timeSeriesResponse: TimeSeriesResponse
): IResolution | null => {
  if (timeSeriesResponse.length === 0) return null;
  const firstRow = timeSeriesResponse[0];

  if ('dimension_date_last_action.month' in firstRow) {
    return 'month';
  }

  if ('dimension_date_last_action.week' in firstRow) {
    return 'week';
  }

  return 'day';
};

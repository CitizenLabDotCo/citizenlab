import { TimeSeriesResponseRow } from './typings';
import { IResolution } from 'components/admin/ResolutionControl';

export const deduceResolution = (
  timeSeriesResponse: TimeSeriesResponseRow[]
): IResolution | null => {
  if (timeSeriesResponse.length === 0) return null;
  const firstRow = timeSeriesResponse[0];

  if ('dimension_date_registration.month' in firstRow) {
    return 'month';
  }

  if ('dimension_date_registration.week' in firstRow) {
    return 'week';
  }

  return 'day';
};

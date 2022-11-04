import { TimeSeriesResponseRow } from './typings';
import { resolutionDeducer } from '../../utils/resolution';

export const deduceResolution = resolutionDeducer<TimeSeriesResponseRow>(
  'dimension_date_last_action'
);

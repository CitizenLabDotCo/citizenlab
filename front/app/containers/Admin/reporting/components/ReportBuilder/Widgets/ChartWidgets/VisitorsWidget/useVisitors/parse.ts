import moment, { Moment } from 'moment';

// utils
import { timeSeriesParser } from 'components/admin/GraphCards/_utils/timeSeries';
import { get } from 'utils/helperUtils';

// typings
import { IResolution } from 'components/admin/ResolutionControl';
import { TimeSeries, TimeSeriesResponseRow, TimeSeriesRow } from './typings';
import { VisitorsResponse } from 'api/graph_data_units/responseTypes';

export const getEmptyRow = (date: Moment) => ({
  date: date.format('YYYY-MM-DD'),
  visitors: 0,
  visits: 0,
});

const parseRow = (date: Moment, row?: TimeSeriesResponseRow): TimeSeriesRow => {
  if (!row) return getEmptyRow(date);

  return {
    visitors: row.count_visitor_id,
    visits: row.count,
    date: date.format('YYYY-MM-DD'),
  };
};

const getDate = (row: TimeSeriesResponseRow) => {
  return moment(get(row, 'first_dimension_date_first_action_date'));
};

const _parseTimeSeries = timeSeriesParser(getDate, parseRow);

export const parseTimeSeries = (
  responseTimeSeries: VisitorsResponse['data']['attributes'][1],
  startAtMoment: Moment | null | undefined,
  endAtMoment: Moment | null,
  resolution: IResolution
): TimeSeries | null => {
  return _parseTimeSeries(
    responseTimeSeries,
    startAtMoment,
    endAtMoment,
    resolution
  );
};

export const parseStats = ([
  totalsWholePeriodRows,
]: VisitorsResponse['data']['attributes']) => {
  const wholePeriod = totalsWholePeriodRows[0];

  return {
    visitors: {
      value: wholePeriod?.count_visitor_id.toLocaleString() ?? '0',
    },
    visits: {
      value: wholePeriod?.count.toLocaleString() ?? '0',
    },
  };
};

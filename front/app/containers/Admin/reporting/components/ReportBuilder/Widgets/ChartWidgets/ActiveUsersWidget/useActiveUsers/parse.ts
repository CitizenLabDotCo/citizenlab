import moment, { Moment } from 'moment';

// utils
import { timeSeriesParser } from 'components/admin/GraphCards/_utils/timeSeries';
import { get } from 'utils/helperUtils';

// typings
import { TimeSeriesResponseRow, TimeSeriesRow, TimeSeries } from './typings';
import { IResolution } from 'components/admin/ResolutionControl';
import { ActiveUsersResponse } from 'api/graph_data_units/responseTypes';

export const getEmptyRow = (date: Moment) => ({
  date: date.format('YYYY-MM-DD'),
  activeUsers: 0,
});

const parseRow = (date: Moment, row?: TimeSeriesResponseRow): TimeSeriesRow => {
  if (!row) return getEmptyRow(date);

  return {
    activeUsers: row.count_dimension_user_id,
    date: date.format('YYYY-MM-DD'),
  };
};

const getDate = (row: TimeSeriesResponseRow) => {
  return moment(get(row, 'first_dimension_date_created_date'));
};

const _parseTimeSeries = timeSeriesParser(getDate, parseRow);

export const parseTimeSeries = (
  responseTimeSeries: ActiveUsersResponse['data']['attributes'][0],
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

export const parseStats = (data: ActiveUsersResponse['data']['attributes']) => {
  const activeUsersWholePeriod = data[1][0];

  return {
    activeUsers: {
      value: (activeUsersWholePeriod?.count_dimension_user_id ?? 0).toString(),
    },
  };
};

import moment, { Moment } from 'moment';

import {
  ActiveUsersResponse,
  TimeSeriesResponseRow,
} from 'api/graph_data_units/responseTypes/ActiveUsersWidget';

import { timeSeriesParser } from 'components/admin/GraphCards/_utils/timeSeries';
import {
  TimeSeriesRow,
  TimeSeries,
} from 'components/admin/GraphCards/ActiveUsersCard/useActiveUsers/typings';
import { IResolution } from 'components/admin/ResolutionControl';

import { get } from 'utils/helperUtils';

export const getEmptyRow = (date: Moment) => ({
  date: date.format('YYYY-MM-DD'),
  activeUsers: 0,
});

const parseRow = (date: Moment, row?: TimeSeriesResponseRow): TimeSeriesRow => {
  if (!row) return getEmptyRow(date);

  return {
    activeUsers: row.count_participant_id,
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
  const activeUsersPreviousPeriod = data[3]?.[0];

  const wholePeriodValue = activeUsersWholePeriod?.count_participant_id ?? 0;
  const previousPeriodValue = activeUsersPreviousPeriod?.count_participant_id;

  const previousPeriodDelta = previousPeriodValue
    ? wholePeriodValue - previousPeriodValue
    : undefined;

  return {
    activeUsers: {
      value: wholePeriodValue.toString(),
      previousPeriodDelta,
    },
  };
};

import moment, { Moment } from 'moment';
import { parseMonths, parseWeeks, parseDays } from './timeSeries';

interface BaseRow {
  count: number;
  count_visitor_id: number;
}

type TimeSeriesResponse = TimeSeriesResponseRow[];

type TimeSeriesResponseRow =
  | TimeSeriesResponseMonth
  | TimeSeriesResponseWeek
  | TimeSeriesResponseDay;

interface TimeSeriesResponseMonth extends BaseRow {
  'dimension_date_last_action.month': string;
}

interface TimeSeriesResponseWeek extends BaseRow {
  'dimension_date_last_action.week': string;
}

interface TimeSeriesResponseDay extends BaseRow {
  'dimension_date_last_action.date': string;
}

interface TimeSeriesRow {
  /* Date format: YYYY-MM-DD */
  date: string;
  visits: number;
  visitors: number;
}

type TimeSeries = TimeSeriesRow[];

const parseRow = (date: Moment, row?: TimeSeriesResponseRow): TimeSeriesRow => {
  if (!row) return getEmptyRow(date);

  return {
    visitors: row.count_visitor_id,
    visits: row.count,
    date: getDate(row).format('YYYY-MM-DD'),
  };
};

const getEmptyRow = (date: Moment) => ({
  date: date.format('YYYY-MM-DD'),
  visitors: 0,
  visits: 0,
});

const getDate = (row: TimeSeriesResponseRow) => {
  if ('dimension_date_last_action.month' in row) {
    return moment(row['dimension_date_last_action.month']);
  }

  if ('dimension_date_last_action.week' in row) {
    return moment(row['dimension_date_last_action.week']);
  }

  return moment(row['dimension_date_last_action.date']);
};

describe('parseMonths', () => {
  const continuousData: TimeSeriesResponse = [
    {
      count: 3,
      count_visitor_id: 3,
      'dimension_date_last_action.month': '2022-01',
    },
    {
      count: 1,
      count_visitor_id: 1,
      'dimension_date_last_action.month': '2021-11',
    },
    {
      count: 4,
      count_visitor_id: 4,
      'dimension_date_last_action.month': '2022-02',
    },
    {
      count: 2,
      count_visitor_id: 2,
      'dimension_date_last_action.month': '2021-12',
    },
  ];

  const dataWithGap: TimeSeriesResponse = [
    continuousData[0],
    continuousData[1],
    continuousData[2],
  ];

  const expectedContinuousData: TimeSeries = [
    { date: '2021-11-01', visits: 1, visitors: 1 },
    { date: '2021-12-01', visits: 2, visitors: 2 },
    { date: '2022-01-01', visits: 3, visitors: 3 },
    { date: '2022-02-01', visits: 4, visitors: 4 },
  ];

  const expectedDataWithGap: TimeSeries = [
    { date: '2021-11-01', visits: 1, visitors: 1 },
    { date: '2021-12-01', visits: 0, visitors: 0 },
    { date: '2022-01-01', visits: 3, visitors: 3 },
    { date: '2022-02-01', visits: 4, visitors: 4 },
  ];

  const startMoment = moment('2021-09-01');
  const endMoment = moment('2022-04-01');

  const expectedDataBefore: TimeSeries = [
    {
      date: '2021-09-01',
      visitors: 0,
      visits: 0,
    },
    {
      date: '2021-10-01',
      visitors: 0,
      visits: 0,
    },
  ];

  const expectedDataAfter: TimeSeries = [
    {
      date: '2022-03-01',
      visitors: 0,
      visits: 0,
    },
    {
      date: '2022-04-01',
      visitors: 0,
      visits: 0,
    },
  ];

  it('works without start and end date (continuousData)', () => {
    const output = parseMonths(continuousData, null, null, getDate, parseRow);

    expect(output).toEqual(expectedContinuousData);
  });

  it('works with only start date (continuousData)', () => {
    const output = parseMonths(
      continuousData,
      startMoment,
      null,
      getDate,
      parseRow
    );

    const expectedOutput: TimeSeries = [
      ...expectedDataBefore,
      ...expectedContinuousData,
    ];

    expect(output).toEqual(expectedOutput);
  });

  it('works with only end date (continuousData)', () => {
    const output = parseMonths(
      continuousData,
      null,
      endMoment,
      getDate,
      parseRow
    );

    const expectedOutput: TimeSeries = [
      ...expectedContinuousData,
      ...expectedDataAfter,
    ];

    expect(output).toEqual(expectedOutput);
  });

  it('works with both start and end date (continuousData)', () => {
    const output = parseMonths(
      continuousData,
      startMoment,
      endMoment,
      getDate,
      parseRow
    );

    const expectedOutput: TimeSeries = [
      ...expectedDataBefore,
      ...expectedContinuousData,
      ...expectedDataAfter,
    ];

    expect(output).toEqual(expectedOutput);
  });

  it('works without start and end date (dataWithGap)', () => {
    const output = parseMonths(dataWithGap, null, null, getDate, parseRow);

    expect(output).toEqual(expectedDataWithGap);
  });

  it('works with only start date (dataWithGap)', () => {
    const output = parseMonths(
      dataWithGap,
      startMoment,
      null,
      getDate,
      parseRow
    );

    const expectedOutput: TimeSeries = [
      ...expectedDataBefore,
      ...expectedDataWithGap,
    ];

    expect(output).toEqual(expectedOutput);
  });

  it('works with only end date (dataWithGap)', () => {
    const output = parseMonths(dataWithGap, null, endMoment, getDate, parseRow);

    const expectedOutput: TimeSeries = [
      ...expectedDataWithGap,
      ...expectedDataAfter,
    ];

    expect(output).toEqual(expectedOutput);
  });

  it('works with both start and end date (dataWithGap)', () => {
    const output = parseMonths(
      dataWithGap,
      startMoment,
      endMoment,
      getDate,
      parseRow
    );

    const expectedOutput: TimeSeries = [
      ...expectedDataBefore,
      ...expectedDataWithGap,
      ...expectedDataAfter,
    ];

    expect(output).toEqual(expectedOutput);
  });

  it('works with large gap', () => {
    const data = [
      {
        'dimension_date_last_action.month': '2021-10',
        count_visitor_id: 1,
        count: 1,
      },
      {
        'dimension_date_last_action.month': '2022-02',
        count_visitor_id: 1,
        count: 1,
      },
    ];

    const output = parseMonths(data, null, null, getDate, parseRow);

    const expectedOutput = [
      { date: '2021-10-01', visits: 1, visitors: 1 },
      { date: '2021-11-01', visits: 0, visitors: 0 },
      { date: '2021-12-01', visits: 0, visitors: 0 },
      { date: '2022-01-01', visits: 0, visitors: 0 },
      { date: '2022-02-01', visits: 1, visitors: 1 },
    ];

    expect(output).toEqual(expectedOutput);
  });
});

describe('parseWeeks', () => {
  const continuousData: TimeSeriesResponse = [
    {
      count: 3,
      count_visitor_id: 3,
      'dimension_date_last_action.month': '2022-01-03',
    },
    {
      count: 1,
      count_visitor_id: 1,
      'dimension_date_last_action.week': '2021-12-20',
    },
    {
      count: 4,
      count_visitor_id: 4,
      'dimension_date_last_action.month': '2022-01-10',
    },
    {
      count: 2,
      count_visitor_id: 2,
      'dimension_date_last_action.month': '2021-12-27',
    },
  ];

  const dataWithGap: TimeSeriesResponse = [
    continuousData[0],
    continuousData[1],
    continuousData[2],
  ];

  const expectedContinuousData: TimeSeries = [
    { date: '2021-12-20', visits: 1, visitors: 1 },
    { date: '2021-12-27', visits: 2, visitors: 2 },
    { date: '2022-01-03', visits: 3, visitors: 3 },
    { date: '2022-01-10', visits: 4, visitors: 4 },
  ];

  const expectedDataWithGap: TimeSeries = [
    { date: '2021-12-20', visits: 1, visitors: 1 },
    { date: '2021-12-27', visits: 0, visitors: 0 },
    { date: '2022-01-03', visits: 3, visitors: 3 },
    { date: '2022-01-10', visits: 4, visitors: 4 },
  ];

  const startMoment = moment('2021-12-08');
  const endMoment = moment('2022-01-27');

  const expectedDataBefore: TimeSeries = [
    {
      date: '2021-12-06',
      visitors: 0,
      visits: 0,
    },
    {
      date: '2021-12-13',
      visitors: 0,
      visits: 0,
    },
  ];

  const expectedDataAfter: TimeSeries = [
    {
      date: '2022-01-17',
      visitors: 0,
      visits: 0,
    },
    {
      date: '2022-01-24',
      visitors: 0,
      visits: 0,
    },
  ];

  it('works without start and end date (continuousData)', () => {
    const output = parseWeeks(continuousData, null, null, getDate, parseRow);

    expect(output).toEqual(expectedContinuousData);
  });

  it('works with only start date (continuousData)', () => {
    const output = parseWeeks(
      continuousData,
      startMoment,
      null,
      getDate,
      parseRow
    );

    const expectedOutput: TimeSeries = [
      ...expectedDataBefore,
      ...expectedContinuousData,
    ];

    expect(output).toEqual(expectedOutput);
  });

  it('works with only end date (continuousData)', () => {
    const output = parseWeeks(
      continuousData,
      null,
      endMoment,
      getDate,
      parseRow
    );

    const expectedOutput: TimeSeries = [
      ...expectedContinuousData,
      ...expectedDataAfter,
    ];

    expect(output).toEqual(expectedOutput);
  });

  it('works with both start and end date (continuousData)', () => {
    const output = parseWeeks(
      continuousData,
      startMoment,
      endMoment,
      getDate,
      parseRow
    );

    const expectedOutput: TimeSeries = [
      ...expectedDataBefore,
      ...expectedContinuousData,
      ...expectedDataAfter,
    ];

    expect(output).toEqual(expectedOutput);
  });

  it('works without start and end date (dataWithGap)', () => {
    const output = parseWeeks(dataWithGap, null, null, getDate, parseRow);

    expect(output).toEqual(expectedDataWithGap);
  });

  it('works with only start date (dataWithGap)', () => {
    const output = parseWeeks(
      dataWithGap,
      startMoment,
      null,
      getDate,
      parseRow
    );

    const expectedOutput: TimeSeries = [
      ...expectedDataBefore,
      ...expectedDataWithGap,
    ];

    expect(output).toEqual(expectedOutput);
  });

  it('works with only end date (dataWithGap)', () => {
    const output = parseWeeks(dataWithGap, null, endMoment, getDate, parseRow);

    const expectedOutput: TimeSeries = [
      ...expectedDataWithGap,
      ...expectedDataAfter,
    ];

    expect(output).toEqual(expectedOutput);
  });

  it('works with both start and end date (dataWithGap)', () => {
    const output = parseWeeks(
      dataWithGap,
      startMoment,
      endMoment,
      getDate,
      parseRow
    );

    const expectedOutput: TimeSeries = [
      ...expectedDataBefore,
      ...expectedDataWithGap,
      ...expectedDataAfter,
    ];

    expect(output).toEqual(expectedOutput);
  });

  it('works with large gap', () => {
    const data = [
      {
        'dimension_date_last_action.month': '2022-01-03',
        count_visitor_id: 1,
        count: 1,
      },
      {
        'dimension_date_last_action.month': '2022-02-07',
        count_visitor_id: 1,
        count: 1,
      },
    ];

    const output = parseWeeks(data, null, null, getDate, parseRow);

    const expectedOutput = [
      { date: '2022-01-03', visits: 1, visitors: 1 },
      { date: '2022-01-10', visits: 0, visitors: 0 },
      { date: '2022-01-17', visits: 0, visitors: 0 },
      { date: '2022-01-24', visits: 0, visitors: 0 },
      { date: '2022-01-31', visits: 0, visitors: 0 },
      { date: '2022-02-07', visits: 1, visitors: 1 },
    ];

    expect(output).toEqual(expectedOutput);
  });
});

describe('parseDays', () => {
  it('works', () => {
    const data: TimeSeriesResponse = [
      {
        'dimension_date_last_action.date': '2021-12-30',
        count: 1,
        count_visitor_id: 1,
      },
      {
        'dimension_date_last_action.date': '2022-01-02',
        count: 1,
        count_visitor_id: 1,
      },
    ];

    const expectedOutput: TimeSeries = [
      {
        date: '2021-12-28',
        visitors: 0,
        visits: 0,
      },
      {
        date: '2021-12-29',
        visitors: 0,
        visits: 0,
      },
      {
        date: '2021-12-30',
        visitors: 1,
        visits: 1,
      },
      {
        date: '2021-12-31',
        visitors: 0,
        visits: 0,
      },
      {
        date: '2022-01-01',
        visitors: 0,
        visits: 0,
      },
      {
        date: '2022-01-02',
        visitors: 1,
        visits: 1,
      },
      {
        date: '2022-01-03',
        visitors: 0,
        visits: 0,
      },
    ];

    expect(
      parseDays(
        data,
        moment('2021-12-28'),
        moment('2022-01-03'),
        getDate,
        parseRow
      )
    ).toEqual(expectedOutput);
  });
});

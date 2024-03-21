import { parseTimeSeries } from './parse';

const testData = [
  {
    count: 1,
    count_visitor_id: 1,
    'dimension_date_first_action.month': '2022-10',
    first_dimension_date_first_action_date: '2022-10-11',
  },
  {
    count: 2,
    count_visitor_id: 1,
    'dimension_date_first_action.month': '2022-11',
    first_dimension_date_first_action_date: '2022-11-25',
  },
  {
    count: 1,
    count_visitor_id: 1,
    'dimension_date_first_action.month': '2023-06',
    first_dimension_date_first_action_date: '2023-06-01',
  },
  {
    count: 2,
    count_visitor_id: 2,
    'dimension_date_first_action.month': '2023-09',
    first_dimension_date_first_action_date: '2023-09-26',
  },
];

const expected = [
  { visitors: 1, visits: 1, date: '2022-10-01' },
  { visitors: 1, visits: 2, date: '2022-11-01' },
  { date: '2022-12-01', visitors: 0, visits: 0 },
  { date: '2023-01-01', visitors: 0, visits: 0 },
  { date: '2023-02-01', visitors: 0, visits: 0 },
  { date: '2023-03-01', visitors: 0, visits: 0 },
  { date: '2023-04-01', visitors: 0, visits: 0 },
  { date: '2023-05-01', visitors: 0, visits: 0 },
  { visitors: 1, visits: 1, date: '2023-06-01' },
  { date: '2023-07-01', visitors: 0, visits: 0 },
  { date: '2023-08-01', visitors: 0, visits: 0 },
  { visitors: 2, visits: 2, date: '2023-09-01' },
];

describe('parseTimeSeries', () => {
  it('should work', () => {
    expect(parseTimeSeries(testData, null, null, 'month')).toEqual(expected);
  });
});

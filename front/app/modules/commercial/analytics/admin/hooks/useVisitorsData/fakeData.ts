import { TimeSeries } from '.';

export const fakeStats = {
  visitors: {
    value: 3092,
    lastPeriod: 309,
  },
  visits: {
    value: 5432,
    lastPeriod: 423,
  },
  duration: {
    value: 312,
    lastPeriod: 373,
  },
  pageViews: {
    value: 3.2,
    lastPeriod: 2.9,
  },
};

export const fakeTimeSeries: TimeSeries = [
  {
    date: '2022-02-01',
    visitors: 70,
    visits: 120,
  },
  {
    date: '2022-03-01',
    visitors: 90,
    visits: 130,
  },
  {
    date: '2022-04-01',
    visitors: 50,
    visits: 90,
  },
  {
    date: '2022-05-01',
    visitors: 70,
    visits: 120,
  },
  {
    date: '2022-06-01',
    visitors: 110,
    visits: 160,
  },
  {
    date: '2022-07-01',
    visitors: 160,
    visits: 220,
  },
  {
    date: '2022-08-01',
    visitors: 180,
    visits: 260,
  },
  {
    date: '2022-09-01',
    visitors: 210,
    visits: 250,
  },
  {
    date: '2022-10-01',
    visitors: 210,
    visits: 230,
  },
];

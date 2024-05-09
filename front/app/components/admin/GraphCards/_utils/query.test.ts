import { getPreviousPeriod } from './query';

describe('getPreviousPeriod', () => {
  it('works', () => {
    const startAt = '2022-10-01';
    const endAt = '2022-10-31';

    const result = getPreviousPeriod(startAt, endAt);

    expect(result).toEqual({
      prev_start_at: '2022-08-31',
      prev_end_at: '2022-09-30',
    });
  });
});

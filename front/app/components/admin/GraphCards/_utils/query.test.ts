import { getComparedTimeRange } from './query';

describe('getComparedTimeRange', () => {
  it('works', () => {
    const startAt = '2022-10-01';
    const endAt = '2022-10-31';

    const result = getComparedTimeRange(startAt, endAt);

    expect(result).toEqual({
      compare_start_at: '2022-08-31',
      compare_end_at: '2022-09-30',
    });
  });
});

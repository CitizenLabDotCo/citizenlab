import moment from 'moment';

import { deriveProjectStatus } from './utils';

describe('deriveProjectStatus', () => {
  it('returns "planned" if startAt is after now', () => {
    const period = {
      start_at: '2021-01-01',
      end_at: '2022-01-01',
    };

    const now = moment('2020-01-01');

    expect(deriveProjectStatus(period, now)).toBe('planned');
  });

  it('returns "open-ended" if no end_at', () => {
    const period = {
      start_at: '2021-01-01',
      end_at: null,
    };

    const now = moment('2021-07-01');

    expect(deriveProjectStatus(period, now)).toBe('open-ended');
  });

  it('returns "finished" if endAt is before now', () => {
    const period = {
      start_at: '2021-01-01',
      end_at: '2021-06-01',
    };

    const now = moment('2021-07-01');

    expect(deriveProjectStatus(period, now)).toBe('finished');
  });

  it('returns "active" if endAt is after now', () => {
    const period = {
      start_at: '2021-01-01',
      end_at: '2022-01-01',
    };

    const now = moment('2021-07-01');

    expect(deriveProjectStatus(period, now)).toBe('active');
  });
});

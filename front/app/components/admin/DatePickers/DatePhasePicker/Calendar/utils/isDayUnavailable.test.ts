import { isDayUnavailable } from './isDayUnavailable';

describe('isDayUnavailable', () => {
  const phase = {
    from: new Date(2024, 2, 1, 12, 0),
    to: new Date(2024, 2, 10, 12, 0),
  };

  it('is false without other phases', () => {
    expect(isDayUnavailable(new Date(2024, 2, 5), [])).toBe(false);
  });

  it('is true inside another phase', () => {
    expect(isDayUnavailable(new Date(2024, 2, 5), [phase])).toBe(true);
  });

  it('is false on the start and end day of another phase with time left', () => {
    expect(isDayUnavailable(new Date(2024, 2, 1), [phase])).toBe(false);
    expect(isDayUnavailable(new Date(2024, 2, 10), [phase])).toBe(false);
  });

  it('is true on the day of a one-day phase', () => {
    const oneDay = { from: new Date(2024, 2, 1), to: new Date(2024, 2, 1) };

    expect(isDayUnavailable(new Date(2024, 2, 1), [oneDay])).toBe(true);
  });

  it('is true on a start day at midnight and an end day at 23:59', () => {
    const fullDays = {
      from: new Date(2024, 2, 1, 0, 0),
      to: new Date(2024, 2, 10, 23, 59),
    };

    expect(isDayUnavailable(new Date(2024, 2, 1), [fullDays])).toBe(true);
    expect(isDayUnavailable(new Date(2024, 2, 10), [fullDays])).toBe(true);
  });

  it('is true on a day where one phase ends and the next starts', () => {
    const next = {
      from: new Date(2024, 2, 10, 14, 0),
      to: new Date(2024, 2, 20, 12, 0),
    };

    expect(isDayUnavailable(new Date(2024, 2, 10), [phase, next])).toBe(true);
  });

  it('keeps the days after an open-ended phase available', () => {
    const openEnded = { from: new Date(2024, 2, 1, 12, 0) };

    expect(isDayUnavailable(new Date(2024, 2, 5), [openEnded])).toBe(false);
  });
});

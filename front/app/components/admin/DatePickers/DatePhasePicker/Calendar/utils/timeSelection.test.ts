import {
  getDisplayTimes,
  getRangeAfterDayClick,
  isSingleDayRange,
  withTime,
} from './timeSelection';

describe('getDisplayTimes', () => {
  it('prefers the times picked in the time inputs', () => {
    const selectedStartTime = new Date(2024, 2, 1, 9, 15);
    const selectedEndTime = new Date(2024, 2, 1, 17, 45);

    expect(
      getDisplayTimes({
        selectedRange: {
          from: new Date(2024, 2, 1, 10),
          to: new Date(2024, 2, 5, 12),
        },
        disabledRanges: [],
        selectedStartTime,
        selectedEndTime,
      })
    ).toEqual({ startTime: selectedStartTime, endTime: selectedEndTime });
  });

  it('uses the boundaries of phases sharing the start and end day', () => {
    const before = {
      from: new Date(2024, 1, 1),
      to: new Date(2024, 2, 1, 12),
    };
    const after = { from: new Date(2024, 2, 5, 14), to: new Date(2024, 3, 1) };

    expect(
      getDisplayTimes({
        selectedRange: {
          from: new Date(2024, 2, 1, 10),
          to: new Date(2024, 2, 5, 12),
        },
        disabledRanges: [before, after],
        selectedStartTime: null,
        selectedEndTime: null,
      })
    ).toEqual({ startTime: before.to, endTime: after.from });
  });

  it('falls back to the range itself', () => {
    const selectedRange = {
      from: new Date(2024, 2, 1, 10),
      to: new Date(2024, 2, 5, 12),
    };

    expect(
      getDisplayTimes({
        selectedRange,
        disabledRanges: [],
        selectedStartTime: null,
        selectedEndTime: null,
      })
    ).toEqual({ startTime: selectedRange.from, endTime: selectedRange.to });
  });

  it('shows 00:00 and 23:59 without a range', () => {
    const { startTime, endTime } = getDisplayTimes({
      selectedRange: {},
      disabledRanges: [],
      selectedStartTime: null,
      selectedEndTime: null,
    });

    expect([startTime.getHours(), startTime.getMinutes()]).toEqual([0, 0]);
    expect([endTime.getHours(), endTime.getMinutes()]).toEqual([23, 59]);
  });
});

describe('isSingleDayRange', () => {
  it('is true for a range of exactly 24 hours', () => {
    expect(
      isSingleDayRange({ from: new Date(2024, 2, 1), to: new Date(2024, 2, 2) })
    ).toBe(true);
  });

  it('is false for other ranges and for open ranges', () => {
    expect(
      isSingleDayRange({
        from: new Date(2024, 2, 1),
        to: new Date(2024, 2, 1, 23, 59),
      })
    ).toBe(false);
    expect(isSingleDayRange({ from: new Date(2024, 2, 1) })).toBe(false);
  });
});

describe('withTime', () => {
  it('keeps the day and takes the hours and minutes', () => {
    expect(
      withTime(new Date(2024, 2, 1, 10, 0), new Date(2020, 0, 1, 14, 30))
    ).toEqual(new Date(2024, 2, 1, 14, 30));
  });
});

describe('getRangeAfterDayClick', () => {
  const startTime = new Date(2024, 0, 1, 9, 0);
  const endTime = new Date(2024, 0, 1, 18, 30);

  it('starts a range at the shown start time', () => {
    expect(
      getRangeAfterDayClick({
        selectedRange: {},
        disabledRanges: [],
        clickedDate: new Date(2024, 2, 1),
        startTime,
        endTime,
      })
    ).toEqual({
      range: { from: new Date(2024, 2, 1, 9, 0), to: undefined },
      startTime: null,
      endTime: null,
    });
  });

  it('ends a range at the shown end time', () => {
    expect(
      getRangeAfterDayClick({
        selectedRange: { from: new Date(2024, 2, 1, 9, 0) },
        disabledRanges: [],
        clickedDate: new Date(2024, 2, 10),
        startTime,
        endTime,
      })
    ).toEqual({
      range: {
        from: new Date(2024, 2, 1, 9, 0),
        to: new Date(2024, 2, 10, 18, 30),
      },
      startTime: null,
      endTime: null,
    });
  });

  it('ends at 23:59 when the shown end time is midnight', () => {
    const { range } = getRangeAfterDayClick({
      selectedRange: { from: new Date(2024, 2, 1, 9, 0) },
      disabledRanges: [],
      clickedDate: new Date(2024, 2, 10),
      startTime,
      endTime: new Date(2024, 0, 1, 0, 0),
    });

    expect(range.to).toEqual(new Date(2024, 2, 10, 23, 59));
  });

  it('makes a one-day phase from midnight to midnight when the start is clicked again', () => {
    expect(
      getRangeAfterDayClick({
        selectedRange: { from: new Date(2024, 2, 1, 9, 0) },
        disabledRanges: [],
        clickedDate: new Date(2024, 2, 1),
        startTime,
        endTime,
      }).range
    ).toEqual({
      from: new Date(2024, 2, 1, 0, 0),
      to: new Date(2024, 2, 2, 0, 0),
    });
  });

  it('restarts the range when the end would overlap another phase', () => {
    expect(
      getRangeAfterDayClick({
        selectedRange: { from: new Date(2024, 2, 1, 9, 0) },
        disabledRanges: [
          { from: new Date(2024, 2, 5), to: new Date(2024, 2, 8) },
        ],
        clickedDate: new Date(2024, 2, 10),
        startTime,
        endTime,
      }).range
    ).toEqual({ from: new Date(2024, 2, 10, 9, 0), to: undefined });
  });

  it('starts after a phase that ends on the clicked day', () => {
    const phaseEnd = new Date(2024, 2, 1, 12, 0);

    expect(
      getRangeAfterDayClick({
        selectedRange: {},
        disabledRanges: [{ from: new Date(2024, 1, 1), to: phaseEnd }],
        clickedDate: new Date(2024, 2, 1),
        startTime,
        endTime,
      })
    ).toEqual({
      range: { from: new Date(2024, 2, 1, 12, 0), to: undefined },
      startTime: phaseEnd,
      endTime: null,
    });
  });

  it('ends before a phase that starts on the clicked day', () => {
    const phaseStart = new Date(2024, 2, 10, 14, 0);

    expect(
      getRangeAfterDayClick({
        selectedRange: { from: new Date(2024, 2, 1, 9, 0) },
        disabledRanges: [{ from: phaseStart, to: new Date(2024, 3, 1) }],
        clickedDate: new Date(2024, 2, 10),
        startTime,
        endTime,
      })
    ).toEqual({
      range: {
        from: new Date(2024, 2, 1, 9, 0),
        to: new Date(2024, 2, 10, 14, 0),
      },
      startTime: null,
      endTime: phaseStart,
    });
  });
});

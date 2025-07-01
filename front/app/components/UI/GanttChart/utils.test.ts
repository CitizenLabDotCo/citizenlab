import {
  getOffsetInDays,
  getDurationInDays,
  getOffsetInMonths,
  getDurationInMonths,
  getMonthMeta,
  getYearMeta,
  getTimeRangeDates,
  getQuarterCellsMeta,
  getOffsetInQuarterCells,
  getDurationInQuarterCells,
  getWeekMeta,
  getOffsetInWeeks,
  getDurationInWeeks,
} from './utils';

const date = (str: string) => new Date(str);

const expectDateToMatch = (received: Date, expected: string) => {
  const [year, month, day] = expected.split('-').map(Number);
  expect(received.getFullYear()).toBe(year);
  expect(received.getMonth()).toBe(month - 1);
  expect(received.getDate()).toBe(day);
};

describe('GanttChart utils', () => {
  describe('Date Offset and Duration', () => {
    it('getOffsetInDays: returns correct offset in days', () => {
      expect(getOffsetInDays(date('2024-01-01'), date('2024-01-05'))).toBe(4);
    });

    it('getDurationInDays: returns inclusive duration in days', () => {
      expect(getDurationInDays(date('2024-01-01'), date('2024-01-05'))).toBe(5);
    });

    it('getOffsetInMonths: returns correct offset in months', () => {
      expect(getOffsetInMonths(date('2024-01-01'), date('2024-03-01'))).toBe(2);
    });

    it('getDurationInMonths: returns inclusive duration in calendar months', () => {
      expect(getDurationInMonths(date('2024-01-01'), date('2024-03-31'))).toBe(
        3
      );
    });
  });

  describe('getTimeRangeDates', () => {
    const today = date('2024-06-15');

    it('returns correct range for "month" view', () => {
      const { startDate, endDate } = getTimeRangeDates('month', today);
      expectDateToMatch(startDate, '2024-05-31');
      expectDateToMatch(endDate, '2024-06-30');
    });

    it('returns correct range for "quarter" view', () => {
      const { startDate, endDate } = getTimeRangeDates('quarter', today);
      expectDateToMatch(startDate, '2024-05-01');
      expectDateToMatch(endDate, '2024-07-31');
    });

    it('returns correct range for "year" view', () => {
      const { startDate, endDate } = getTimeRangeDates('year', today);
      expectDateToMatch(startDate, '2023-12-15');
      expectDateToMatch(endDate, '2024-12-15');
    });

    it('returns correct range for "multiyear" view', () => {
      const { startDate, endDate } = getTimeRangeDates('multiyear', today);
      expectDateToMatch(startDate, '2022-01-01');
      expectDateToMatch(endDate, '2026-12-31');
    });
  });

  describe('Timeline Metadata Generation', () => {
    it('getMonthMeta: generates correct metadata for a given date range', () => {
      const meta = getMonthMeta(date('2024-01-15'), date('2024-03-10'));
      expect(meta).toHaveLength(3);
      expect(meta[0]).toEqual({
        label: 'January 2024',
        daysInMonth: 17,
        offsetDays: 0,
      });
      expect(meta[1]).toEqual({
        label: 'February 2024',
        daysInMonth: 29,
        offsetDays: 17,
      });
      expect(meta[2]).toEqual({
        label: 'March 2024',
        daysInMonth: 10,
        offsetDays: 46,
      });
    });

    it('getYearMeta: generates correct metadata across multiple years', () => {
      const meta = getYearMeta(date('2022-06-01'), date('2024-03-01'));
      expect(meta).toHaveLength(3);
      expect(meta[0]).toEqual({
        label: '2022',
        monthsInYear: 7,
        offsetMonths: 0,
      });
      expect(meta[1]).toEqual({
        label: '2023',
        monthsInYear: 12,
        offsetMonths: 7,
      });
      expect(meta[2]).toEqual({
        label: '2024',
        monthsInYear: 3,
        offsetMonths: 19,
      });
    });
  });

  describe('Weekly View Utilities', () => {
    const timelineStart = date('2023-12-25');
    const timelineEnd = date('2024-01-14');
    const weeks = getWeekMeta(timelineStart, timelineEnd);

    it('getWeekMeta: generates correct week metadata, spanning a year change', () => {
      expect(weeks).toHaveLength(3);
      expect(weeks[0]).toMatchObject({ year: 2023, weekNumber: 52 });
      expect(weeks[1]).toMatchObject({ year: 2024, weekNumber: 1 });
      expect(weeks[2]).toMatchObject({ year: 2024, weekNumber: 2 });
    });

    it('getOffsetInWeeks: returns the correct week offset', () => {
      expect(getOffsetInWeeks(timelineStart, date('2024-01-01'))).toBe(1);
    });

    it('getDurationInWeeks: returns the correct inclusive week duration', () => {
      expect(getDurationInWeeks(date('2023-12-28'), date('2024-01-02'))).toBe(
        2
      );
    });
  });

  describe('Quarterly View Utilities (3-day cells)', () => {
    it('getQuarterCellsMeta: generates correct 3-day cells, spanning a month change', () => {
      const cells = getQuarterCellsMeta(date('2024-02-27'), date('2024-03-05'));
      // The logic now correctly produces 4 cells to cover the partial start and end
      expect(cells).toHaveLength(4);

      // The first cell starts on Feb 25 to include Feb 27, and its start date is clamped
      expect(cells[0].label).toBe('25');
      expectDateToMatch(cells[0].startDate, '2024-02-27');
      expectDateToMatch(cells[0].endDate, '2024-02-27');

      // The second cell is the next full cell in the range
      expect(cells[1].label).toBe('28');
      expectDateToMatch(cells[1].startDate, '2024-02-28');
      expectDateToMatch(cells[1].endDate, '2024-02-29'); // End of Feb is 29 in leap year

      // The last cell is clamped by the timeline's end date
      expect(cells[3].label).toBe('4');
      expectDateToMatch(cells[3].startDate, '2024-03-04');
      expectDateToMatch(cells[3].endDate, '2024-03-05');
    });

    it('getOffsetInQuarterCells: returns the correct cell offset', () => {
      const cells = getQuarterCellsMeta(date('2024-01-01'), date('2024-01-10'));
      expect(getOffsetInQuarterCells(cells, date('2024-01-04'))).toBe(1);
    });

    it('getDurationInQuarterCells: returns the correct inclusive cell duration', () => {
      const cells = getQuarterCellsMeta(date('2024-01-01'), date('2024-01-10'));
      expect(
        getDurationInQuarterCells(cells, date('2024-01-01'), date('2024-01-04'))
      ).toBe(2);
    });
  });
});

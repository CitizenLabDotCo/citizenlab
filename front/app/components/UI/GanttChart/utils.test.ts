import {
  getTimeRangeDates,
  groupDayCellsByMonth,
  groupWeekCellsByYear,
  getDayCells,
  getWeekCells,
  getQuarterCells,
  getPreciseOffsetInMonths,
  getPreciseDurationInMonths,
  getPreciseOffsetInWeeks,
  getPreciseDurationInWeeks,
  getPreciseOffsetInQuarters,
  getPreciseDurationInQuarters,
  dayWidth,
  weekWidth,
} from './utils';

// Helper to create dates and avoid timezone issues in tests.
const date = (str: string) => new Date(`${str}T00:00:00`);

// Helper to check date components since direct date comparison can be tricky.
const expectDateToMatch = (received: Date, expected: string) => {
  const [year, month, day] = expected.split('-').map(Number);
  expect(received.getFullYear()).toBe(year);
  expect(received.getMonth()).toBe(month - 1);
  expect(received.getDate()).toBe(day);
};

describe('GanttChart utils', () => {
  describe('getTimeRangeDates', () => {
    const today = date('2025-07-02');

    it('returns correct range for "month" view', () => {
      const { startDate, endDate } = getTimeRangeDates('month', today);
      expectDateToMatch(startDate, '2025-06-17');
      expectDateToMatch(endDate, '2025-07-17');
    });

    it('returns correct range for "quarter" view', () => {
      const { startDate, endDate } = getTimeRangeDates('quarter', today);
      expectDateToMatch(startDate, '2025-06-01');
      expectDateToMatch(endDate, '2025-08-31');
    });

    it('returns correct range for "year" view', () => {
      const { startDate, endDate } = getTimeRangeDates('year', today);
      expectDateToMatch(startDate, '2025-01-02');
      expectDateToMatch(endDate, '2026-01-02');
    });

    it('returns correct range for "multiyear" view', () => {
      const { startDate, endDate } = getTimeRangeDates('multiyear', today);
      expectDateToMatch(startDate, '2023-01-01');
      expectDateToMatch(endDate, '2027-12-31');
    });
  });

  describe('Timeline Metadata Generation (Grouping)', () => {
    it('groupDayCellsByMonth: generates correct groups for a given date range', () => {
      const cells = getDayCells(date('2025-01-30'), date('2025-03-02'));
      const groups = groupDayCellsByMonth(cells, () => dayWidth);

      expect(groups).toHaveLength(3);
      expect(groups[0].label).toBe('January 2025');
      expect(groups[0].subCells).toHaveLength(2); // Jan 30, 31
      expect(groups[1].label).toBe('February 2025');
      expect(groups[1].subCells).toHaveLength(28);
      expect(groups[2].label).toBe('March 2025');
      expect(groups[2].subCells).toHaveLength(2); // Mar 1, 2
    });

    it('groupWeekCellsByYear: generates correct groups across a year change', () => {
      const cells = getWeekCells(date('2025-12-22'), date('2026-01-12'));
      const groups = groupWeekCellsByYear(cells, () => weekWidth);

      expect(groups).toHaveLength(2);
      expect(groups[0].label).toBe('2025');
      expect(groups[0].subCells).toHaveLength(1); // Week 52 of 2025
      expect(groups[1].label).toBe('2026');
      expect(groups[1].subCells).toHaveLength(3); // Weeks 1, 2, 3 of 2026
    });
  });

  describe('Precise Offset and Duration Calculations', () => {
    describe('Monthly Precision (Multi-year view)', () => {
      const timelineStart = date('2025-01-01');
      it('getPreciseOffsetInMonths: returns correct fractional offset', () => {
        // Mid-month (16th of 31 days in Jan is ~halfway)
        expect(
          getPreciseOffsetInMonths(timelineStart, date('2025-01-16'))
        ).toBeCloseTo(0.48, 2);
        // Start of the second month
        expect(
          getPreciseOffsetInMonths(timelineStart, date('2025-02-01'))
        ).toBe(1.0);
      });
      it('getPreciseDurationInMonths: returns correct fractional duration', () => {
        const start = date('2025-01-08'); // 1/4 into Jan
        const end = date('2025-02-15'); // 1/2 into Feb
        // Duration should be roughly (1 - 0.25) + 0.5 = 1.25 months
        expect(
          getPreciseDurationInMonths(start, end, timelineStart)
        ).toBeCloseTo(1.25, 1);
      });
    });

    describe('Weekly Precision (Year view)', () => {
      const timelineStart = date('2025-06-30'); // A Monday
      it('getPreciseOffsetInWeeks: returns correct fractional offset', () => {
        // Start of the week (Monday)
        expect(getPreciseOffsetInWeeks(timelineStart, date('2025-06-30'))).toBe(
          0.0
        );
        // Mid-week (Thursday, 4th day, index 3)
        expect(
          getPreciseOffsetInWeeks(timelineStart, date('2025-07-03'))
        ).toBeCloseTo(3 / 7, 2);
        // Start of the next week
        expect(getPreciseOffsetInWeeks(timelineStart, date('2025-07-07'))).toBe(
          1.0
        );
      });
      it('getPreciseDurationInWeeks: returns correct fractional duration', () => {
        const start = date('2025-07-02'); // Wednesday
        const end = date('2025-07-09'); // Next Wednesday
        expect(
          getPreciseDurationInWeeks(start, end, timelineStart)
        ).toBeCloseTo(1.0, 1);
      });
    });

    describe('Quarterly Precision (Quarter view)', () => {
      const timelineStart = date('2025-01-01');
      const cells = getQuarterCells(timelineStart, date('2025-01-31'));
      it('getPreciseOffsetInQuarters: returns correct fractional offset', () => {
        // First day of first cell (Jan 1)
        expect(getPreciseOffsetInQuarters(cells, date('2025-01-01'))).toBe(0.0);
        // Second day of first cell (Jan 2)
        expect(
          getPreciseOffsetInQuarters(cells, date('2025-01-02'))
        ).toBeCloseTo(1 / 3, 2);
        // Third day of first cell (Jan 3)
        expect(
          getPreciseOffsetInQuarters(cells, date('2025-01-03'))
        ).toBeCloseTo(2 / 3, 2);
        // First day of second cell (Jan 4)
        expect(getPreciseOffsetInQuarters(cells, date('2025-01-04'))).toBe(1.0);
      });
      it('getPreciseDurationInQuarters: returns correct fractional duration', () => {
        const start = date('2025-01-02'); // 1/3 into first cell
        const end = date('2025-01-06'); // 2/3 into second cell
        // Duration should be (1 + 2/3) - 1/3 = 1.33 cells
        expect(getPreciseDurationInQuarters(cells, start, end)).toBeCloseTo(
          4 / 3,
          2
        );
      });
    });
  });
});

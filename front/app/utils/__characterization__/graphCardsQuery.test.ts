import { parseISO } from 'date-fns';

/**
 * CHARACTERIZATION BASELINE — GraphCards query builders.
 *
 * Written before the T6 conversion of `_utils/query.ts` from Moment to Date,
 * and kept afterwards as a regression net.
 * These functions build the `from`/`to` and `compare_start_at`/`compare_end_at`
 * parameters sent to the analytics API, so a wrong value here is not a cosmetic
 * bug — it silently returns data for the wrong period.
 *
 * `query.test.ts` next to the source covers one case; this covers the date
 * arithmetic across DST, month lengths and year boundaries.
 *
 * Two details worth preserving deliberately:
 *
 *   - getDateFilter formats in the *browser's* zone, not the tenant's — it
 *     used moment's `.local()`. It must stay browser-local (plain date-fns
 *     `format`), NOT `toIsoDate`, which would use the tenant zone.
 *   - getComparedTimeRange builds the immediately preceding window of equal
 *     length, ending the day before startAt.
 */

import {
  getDateFilter,
  getComparedTimeRange,
} from 'components/admin/GraphCards/_utils/query';

const RANGES: Array<[string, string]> = [
  ['2026-03-01', '2026-03-31'], // whole month
  ['2026-03-22', '2026-03-22'], // single day
  ['2026-03-25', '2026-04-02'], // crosses a month boundary
  ['2025-12-28', '2026-01-05'], // crosses a year boundary
  ['2026-03-25', '2026-04-01'], // spans EU spring-forward
  ['2026-10-22', '2026-10-28'], // spans EU fall-back
  ['2026-02-01', '2026-02-28'], // short month
  ['2024-02-01', '2024-02-29'], // leap day
];

describe('GraphCards query builders — baseline', () => {
  describe('getDateFilter', () => {
    it.each(RANGES)('builds the filter for %s → %s', (startAt, endAt) => {
      expect(
        getDateFilter(
          'dimension_date_created',
          parseISO(startAt),
          parseISO(endAt)
        )
      ).toMatchSnapshot();
    });

    it('omits missing bounds', () => {
      expect({
        both: getDateFilter('f', undefined, undefined),
        startOnly: getDateFilter('f', parseISO('2026-03-22'), undefined),
        endOnly: getDateFilter('f', undefined, parseISO('2026-03-22')),
        nulls: getDateFilter('f', null, null),
      }).toMatchSnapshot();
    });
  });

  describe('getComparedTimeRange', () => {
    it.each(RANGES)(
      'builds the preceding window for %s → %s',
      (startAt, endAt) => {
        expect(getComparedTimeRange(startAt, endAt)).toMatchSnapshot();
      }
    );

    it('returns nothing without both bounds', () => {
      expect(getComparedTimeRange(undefined, '2026-03-22')).toEqual({});
      expect(getComparedTimeRange('2026-03-22', undefined)).toEqual({});
      expect(getComparedTimeRange()).toEqual({});
    });

    it('the compared window is the same length and ends the day before', () => {
      // Stated invariant, asserted directly so it survives the rewrite even if
      // the snapshots were ever regenerated carelessly.
      const { compare_start_at, compare_end_at } = getComparedTimeRange(
        '2026-03-10',
        '2026-03-20'
      ) as { compare_start_at: string; compare_end_at: string };

      expect(compare_end_at).toBe('2026-03-09');
      expect(compare_start_at).toBe('2026-02-27');
    });
  });
});

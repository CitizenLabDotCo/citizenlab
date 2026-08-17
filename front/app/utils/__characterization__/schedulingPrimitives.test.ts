/**
 * DIFFERENTIAL BASELINE — the date primitives inside the scheduling screens.
 *
 * Written before converting ScheduleModal, ScheduleLaunchModal and
 * DateTimeSelection (T5). Those three components don't expose their date logic
 * as functions, so rather than render them, this pins the *primitives* they
 * each re-implement inline and proves the façade equivalents agree.
 *
 * The three of them independently repeat the same four operations:
 *
 *   1. instant → a Date whose local components read as the tenant's wall clock
 *      (`moment.tz(iso, tz)` then `new Date(m.year(), m.month(), …)`)
 *   2. the inverse: a picked Date's components read as tenant wall clock → UTC
 *   3. the browser's timezone (`moment.tz.guess()`)
 *   4. preserving an event's real duration when its start moves
 *
 * (1) and (2) already exist as `getDateInTimezone` / `convertToTimeZoneISO`,
 * which are converted and pinned in timezoneHelpers.test.ts. The point of this
 * file is to show the components can simply *call* those instead of repeating
 * moment inline — so each `expect` compares the moment expression as written
 * in the component today against the helper that will replace it.
 *
 * If every case here passes, converting those three files is substitution
 * rather than reimplementation.
 */
import moment from 'moment-timezone';

import { getViewerZone } from '../dateFormat';
import { convertToTimeZoneISO, getDateInTimezone } from '../dateUtils';

const ZONES = ['Europe/Brussels', 'UTC', 'America/Santiago'] as const;

/** Instants chosen to sit on either side of a DST transition. */
const INSTANTS = [
  '2026-03-22T14:30:00Z', // ordinary
  '2026-03-29T00:30:00Z', // just before EU spring-forward
  '2026-03-29T01:30:00Z', // just after
  '2026-10-25T00:30:00Z', // EU fall-back
  '2025-12-31T23:30:00Z', // crosses midnight / year in most zones
  '2026-09-06T05:00:00Z', // Chile DST
];

describe('scheduling primitives: moment (today) vs façade helpers', () => {
  afterEach(() => {
    moment.tz.setDefault();
  });

  describe('1. instant → picker Date (tenant wall clock as local components)', () => {
    // This is `toPickerDate` in DateTimeSelection and the `useEffect` bodies in
    // both schedule modals, written out exactly as they appear today.
    const momentVersion = (iso: string, timeZone: string) => {
      const m = moment.tz(iso, timeZone);
      return new Date(
        m.year(),
        m.month(),
        m.date(),
        m.hour(),
        m.minute(),
        m.second()
      );
    };

    ZONES.forEach((zone) => {
      it(`matches getDateInTimezone in ${zone}`, () => {
        INSTANTS.forEach((iso) => {
          expect(getDateInTimezone(iso, zone)?.toISOString()).toBe(
            momentVersion(iso, zone).toISOString()
          );
        });
      });
    });
  });

  describe('2. picker Date → UTC ISO (components read as tenant wall clock)', () => {
    // `fromPickerDate` in DateTimeSelection, `buildScheduledAt` in
    // ScheduleLaunchModal, and the submit handler in ScheduleModal.
    const momentVersion = (date: Date, timeZone: string) =>
      moment
        .tz(
          {
            year: date.getFullYear(),
            month: date.getMonth(),
            day: date.getDate(),
            hour: date.getHours(),
            minute: date.getMinutes(),
            second: date.getSeconds(),
          },
          timeZone
        )
        .utc()
        .toISOString();

    const PICKED = [
      new Date(2026, 0, 15, 9, 30, 0), // winter
      new Date(2026, 6, 15, 9, 30, 0), // summer
      new Date(2026, 2, 29, 2, 30, 0), // inside the EU spring-forward gap
      new Date(2026, 9, 25, 2, 30, 0), // inside the EU fall-back overlap
    ];

    ZONES.forEach((zone) => {
      it(`matches convertToTimeZoneISO in ${zone}`, () => {
        PICKED.forEach((date) => {
          expect(convertToTimeZoneISO(date, zone)).toBe(
            momentVersion(date, zone)
          );
        });
      });
    });
  });

  describe('3. browser timezone', () => {
    it('getViewerZone matches moment.tz.guess()', () => {
      expect(getViewerZone()).toBe(moment.tz.guess());
    });
  });

  describe('4. duration preservation when the start moves', () => {
    // updateStartAt in DateTimeSelection. Deliberately UTC-millisecond
    // arithmetic: an event that spans a DST transition must keep its real
    // length rather than its wall-clock length.
    const momentVersion = (startAt: string, endAt: string, newStart: string) =>
      moment
        .utc(newStart)
        .add(moment.utc(endAt).diff(moment.utc(startAt)), 'ms')
        .toISOString();

    const plainVersion = (startAt: string, endAt: string, newStart: string) =>
      new Date(
        new Date(newStart).getTime() +
          (new Date(endAt).getTime() - new Date(startAt).getTime())
      ).toISOString();

    const CASES: Array<[string, string, string]> = [
      // 2h event moved to another ordinary day
      ['2026-03-22T14:00:00Z', '2026-03-22T16:00:00Z', '2026-04-05T10:00:00Z'],
      // 2h event moved onto the EU spring-forward night
      ['2026-03-22T14:00:00Z', '2026-03-22T16:00:00Z', '2026-03-29T00:30:00Z'],
      // multi-day event
      ['2026-03-22T14:00:00Z', '2026-03-24T16:00:00Z', '2026-06-01T09:00:00Z'],
      // zero-length event
      ['2026-03-22T14:00:00Z', '2026-03-22T14:00:00Z', '2026-05-01T08:00:00Z'],
    ];

    it.each(CASES)(
      'preserves real duration for %s → %s moved to %s',
      (startAt, endAt, newStart) => {
        expect(plainVersion(startAt, endAt, newStart)).toBe(
          momentVersion(startAt, endAt, newStart)
        );
      }
    );

    it('keeps UTC length, not wall-clock length, across spring-forward', () => {
      // 01:30 UTC on 29 March is after Brussels jumps 02:00 → 03:00, so this
      // 2h event reads as 3h on a Brussels wall clock. The stored duration
      // must stay 2h.
      const start = '2026-03-29T00:30:00Z';
      const end = plainVersion(
        '2026-03-22T14:00:00Z',
        '2026-03-22T16:00:00Z',
        start
      );
      expect(new Date(end).getTime() - new Date(start).getTime()).toBe(
        2 * 60 * 60 * 1000
      );
    });
  });
});

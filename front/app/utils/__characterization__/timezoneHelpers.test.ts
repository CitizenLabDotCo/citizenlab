/**
 * CHARACTERIZATION BASELINE — the timezone-sensitive helpers in utils/dateUtils.
 *
 * Written before converting them off moment (T5). These five are the riskiest
 * functions in the migration: they turn an instant into a wall-clock value, so
 * an error here shows up as a date that is silently one day out for users in a
 * particular timezone, with nothing failing.
 *
 * Note what the signatures already tell us about the tenant-vs-viewer question:
 *
 *   getGmtOffset / convertToTimeZoneISO / getDateInTimezone /
 *   getPeriodRemainingUntil   → take the zone as an explicit argument, so they
 *                               never depended on moment.tz.setDefault()
 *   getEventDateString        → deliberately uses the VIEWER's zone
 *                               (`userTimezone`), not the tenant's
 *
 * The suite therefore fixes the process timezone rather than the tenant zone:
 * `userTimezone` is read from the environment at module load, so it is the
 * process TZ that decides what getEventDateString produces.
 */
import moment from 'moment-timezone';

import { IEventData } from 'api/events/types';

import {
  getEventDateString,
  getGmtOffset,
  convertToTimeZoneISO,
  getDateInTimezone,
  getPeriodRemainingUntil,
} from '../dateUtils';

const ZONES = ['Europe/Brussels', 'UTC', 'America/Santiago'] as const;

const INSTANTS = {
  ordinary: '2026-03-22T14:30:00Z',
  euDstSpringForward: '2026-03-29T01:30:00Z',
  euDstFallBack: '2026-10-25T00:30:00Z',
  yearBoundaryDec31: '2025-12-31T23:30:00Z',
  chileDst: '2026-09-06T05:00:00Z',
} as const;

const asEvent = (startAt: string, endAt: string) =>
  ({ attributes: { start_at: startAt, end_at: endAt } } as IEventData);

beforeAll(() => {
  require('moment/locale/fr');
  require('moment/locale/de');
  moment.locale('en');
});

afterEach(() => {
  moment.tz.setDefault();
});

describe('timezone helper baseline', () => {
  describe('getEventDateString — renders in the VIEWER timezone', () => {
    it('same-day event', () => {
      expect(
        getEventDateString(
          asEvent('2026-03-22T14:30:00Z', '2026-03-22T16:00:00Z'),
          'en'
        )
      ).toMatchSnapshot();
    });

    it('multi-day event', () => {
      expect(
        getEventDateString(
          asEvent('2026-03-22T14:30:00Z', '2026-03-24T16:00:00Z'),
          'en'
        )
      ).toMatchSnapshot();
    });

    it('event spanning midnight in the viewer zone', () => {
      expect(
        getEventDateString(
          asEvent('2025-12-31T23:00:00Z', '2026-01-01T01:00:00Z'),
          'en'
        )
      ).toMatchSnapshot();
    });
  });

  describe('getGmtOffset — explicit zone argument', () => {
    ZONES.forEach((zone) => {
      it(`${zone} across DST`, () => {
        expect({
          winter: getGmtOffset(zone, new Date('2026-01-15T12:00:00Z')),
          summer: getGmtOffset(zone, new Date('2026-07-15T12:00:00Z')),
          // selectedDate takes precedence over tenantTimeNow
          selected: getGmtOffset(
            zone,
            new Date('2026-01-15T12:00:00Z'),
            new Date('2026-07-15T12:00:00Z')
          ),
          undefinedZone: getGmtOffset(undefined, new Date()),
        }).toMatchSnapshot();
      });
    });
  });

  describe('convertToTimeZoneISO — local wall clock to UTC instant', () => {
    ZONES.forEach((zone) => {
      it(zone, () => {
        expect({
          winter: convertToTimeZoneISO(new Date(2026, 0, 15, 9, 30, 0), zone),
          summer: convertToTimeZoneISO(new Date(2026, 6, 15, 9, 30, 0), zone),
          missingDate: convertToTimeZoneISO(undefined, zone),
          missingZone: convertToTimeZoneISO(new Date(2026, 0, 15), undefined),
        }).toMatchSnapshot();
      });
    });
  });

  describe('getDateInTimezone — instant to a local-parts Date', () => {
    ZONES.forEach((zone) => {
      it(zone, () => {
        expect(
          Object.fromEntries(
            Object.entries(INSTANTS).map(([name, instant]) => [
              name,
              getDateInTimezone(instant, zone)?.toISOString(),
            ])
          )
        ).toMatchSnapshot();
      });
    });

    it('returns undefined for missing input', () => {
      expect(getDateInTimezone(undefined, 'UTC')).toBeUndefined();
      expect(getDateInTimezone('2026-03-22', undefined)).toBeUndefined();
    });
  });

  describe('getPeriodRemainingUntil — diff from midnight in the given zone', () => {
    ZONES.forEach((zone) => {
      it(zone, () => {
        // Fixed "now" so the diff is deterministic.
        jest.useFakeTimers().setSystemTime(new Date('2026-03-01T10:00:00Z'));
        expect({
          days: getPeriodRemainingUntil('2026-03-22', zone, 'days'),
          weeks: getPeriodRemainingUntil('2026-03-22', zone, 'weeks'),
          months: getPeriodRemainingUntil('2026-06-22', zone, 'months'),
          pastDate: getPeriodRemainingUntil('2026-02-01', zone, 'days'),
          acrossDst: getPeriodRemainingUntil('2026-04-15', zone, 'days'),
        }).toMatchSnapshot();
        jest.useRealTimers();
      });
    });
  });
});
